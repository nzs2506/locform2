const sourceText = document.querySelector("#sourceText");
const convertBtn = document.querySelector("#convertBtn");
const autoConvert = document.querySelector("#autoConvert");
const keepLists = document.querySelector("#keepLists");
const keepTables = document.querySelector("#keepTables");
const dropZone = document.querySelector("#dropZone");
const outputs = {
  topic: document.querySelector("#topicOutput"),
  compact: document.querySelector("#compactOutput"),
  mobile: document.querySelector("#mobileOutput"),
  pc: document.querySelector("#pcOutput"),
};
const keyTabs = document.querySelector("#keyTabs");
const preview = document.querySelector("#preview");
let parsedNotifications = [];
let activeNotificationIndex = 0;

const stableNames = [
  "Drops & Wins",
  "Pragmatic Play",
  "Gates of Olympus 1000",
  "Wisdom of Athena 1000",
  "Big Bass Bonanza 1000",
  "Giros Gratis",
  "Ruedas de Premios Semanales",
];

function escapeHtml(value) {
  return value
    .replace(/&(?!(?:nbsp|amp|lt|gt|quot|#39);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function restoreAllowedTags(value) {
  return value
    .replace(/&lt;(\/?)b&gt;/g, "<$1b>")
    .replace(/&lt;(\/?)i&gt;/g, "<$1i>")
    .replace(/&lt;br&gt;/g, "<br>")
    .replace(/&lt;br\/&gt;/g, "<br>");
}

function cleanUrl(raw) {
  return raw
    .trim()
    .replace(/^\((.*)\)$/s, "$1")
    .replace(/\s*&\s*/g, "&")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s+/g, "");
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "").trim();
}

function normalizeInputText(value) {
  const siteWords = "(?:old\\s*site|oldsite|старый\\s*сайт|redesign\\s*site|redesignsite|redesign|new\\s*site|newsite|new\\s*version|newversion|редизайн|новый\\s*сайт)";
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(new RegExp(`(\\([^)]+\\))\\s*(${siteWords})`, "giu"), "$1\n$2")
    .replace(new RegExp(`(https?:\\/\\/[^\\n\\s]+|\\/[^\\n\\s)]+)\\n(?!${siteWords})([?&=/#\\w-])`, "giu"), "$1$2");
}

function siteMarker(line) {
  const plain = stripTags(line).toLowerCase();
  const compact = plain.replace(/[\s._-]+/g, "");
  if (compact === "oldsite" || compact === "старыйсайт") return "old";
  if (
    compact === "redesignsite" ||
    compact === "redesign" ||
    compact === "newsite" ||
    compact === "newversion" ||
    compact === "редизайн" ||
    compact === "новыйсайт"
  ) return "redesign";
  return "";
}

function isButtonLine(line) {
  return /^(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s+button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s+button)\s*:/iu.test(stripTags(line));
}

function normalizeButtonBlocks(value) {
  const lines = normalizeInputText(value).split("\n");
  const out = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const plain = stripTags(line);
    const marker = plain.match(/^(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s+button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s+button)\s*:?\s*(.*)$/iu);

    if (!marker) {
      out.push(line);
      index += 1;
      continue;
    }

    const label = marker[1];
    let rest = marker[2].trim();
    let next = index + 1;

    if (rest && /\(((?:https?:\/\/|\/)[^)]+)\)\s*$/iu.test(rest)) {
      out.push(`${label}: ${rest}`);
      index += 1;
      continue;
    }

    while (next < lines.length && !stripTags(lines[next])) next += 1;

    if (!rest && next < lines.length) {
      rest = stripTags(lines[next]);
      next += 1;
    }

    while (next < lines.length && !stripTags(lines[next])) next += 1;

    if (rest && next < lines.length) {
      const url = stripTags(lines[next]);
      if (/^\(?((?:https?:\/\/|\/)[^)]+)\)?$/iu.test(url)) {
        out.push(`${label}: ${rest} (${cleanUrl(url)})`);
        index = next + 1;
        continue;
      }
    }

    out.push(line);
    index += 1;
  }

  return out.join("\n");
}

function applyNbsp(value) {
  let html = value;

  html = html.replace(/\b(\d{1,3}(?:[ \u00a0]\d{3})+)\b/g, (match) => match.replace(/[ \u00a0]/g, "&nbsp;"));
  html = html.replace(/(\d(?:&nbsp;|\d)*)(?:\s|&nbsp;)*(₽|руб\.?|BYN|UZS|USD|EUR|\$|€)/gi, "$1&nbsp;$2");
  html = html.replace(/\b(\d+)\s+(₽|BYN|UZS|USD|EUR|\$|€)\b/gi, "$1&nbsp;$2");
  html = html.replace(/(\d+)\s+фриспинов/giu, "$1&nbsp;фриспинов");
  html = html.replace(/до\s+(\d+(?:&nbsp;\d{3})*&nbsp;(?:₽|руб\.?|BYN|UZS|USD|EUR|\$|€))/giu, "до&nbsp;$1");

  for (const name of stableNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedHtml = escaped.replace(" & ", " &amp; ");
    const replacement = name.replace(/ & /g, "&nbsp;&amp;&nbsp;").replace(/ /g, "&nbsp;");
    html = html.replace(new RegExp(escaped, "g"), replacement);
    html = html.replace(new RegExp(escapedHtml, "g"), replacement);
  }

  return html
    .replace(/На кону —/g, "На&nbsp;кону&nbsp;—")
    .replace(/вас —/g, "вас&nbsp;—");
}

function wrapOnce(value, pattern) {
  return value.replace(pattern, (match) => {
    if (match.includes("<b>") || match.includes("</b>")) return match;
    return `<b>${match}</b>`;
  });
}

function normalizeBold(value) {
  let text = value
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/__(.+?)__/g, "<b>$1</b>");

  text = wrapOnce(text, /\d+(?:\s+\d{3})*\s+фриспинов/giu);
  text = wrapOnce(text, /переводите\s+до\s+\d+(?:\s+\d{3})*\s+(?:BYN|UZS|₽|руб\.?|USD|EUR|\$|€)\s+на\s+основной\s+баланс!?/giu);

  for (const name of stableNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`(?<!<b>)${escaped}(?!</b>)`, "g"), `<b>${name}</b>`);
  }

  return text;
}

function formatInline(line) {
  const escaped = restoreAllowedTags(escapeHtml(normalizeBold(line.trim())));
  return applyNbsp(escaped);
}

function parseButton(matchText, color, label, url) {
  return {
    type: "button",
    color,
    text: label.trim(),
    url: cleanUrl(url),
    source: matchText,
  };
}

function buttonColorFromMarker(marker) {
  return /зел|green/i.test(marker) ? "green" : "white";
}

function stripServiceLines(text) {
  return text
    .replace(/^\s*message\.service[\w.-]*(?:\s*[:=].*)?$/gim, "")
    .replace(/^\s*(?:\.topic|topic)\s*[:=].*$/gim, "");
}

function isServiceKeyLine(line) {
  const plain = stripTags(line);
  return /^message\.service(?:\.[a-z0-9_-]+)+$/i.test(plain);
}

function serviceKeyBase(key) {
  return key.replace(/\.topic$/i, "");
}

function keyLabel(key) {
  const match = key.match(/^message\.service\.([a-z]{2,5})\.(\d+)$/i);
  if (match) return `${match[1]}.${match[2]}`;
  return key.replace(/^.*\.(\d+)$/, "$1");
}

function parseNotifications(text) {
  const lines = normalizeButtonBlocks(text).split("\n");
  const sections = [];
  const topics = {};
  let key = "";
  let body = [];
  let awaitingTopicFor = "";

  function save() {
    if (!key) return;
    sections.push({
      key,
      topic: topics[key] || "",
      body: body.join("\n").trim(),
    });
  }

  for (const raw of lines) {
    const plain = stripTags(raw);

    if (isServiceKeyLine(raw)) {
      if (/\.topic$/i.test(plain)) {
        awaitingTopicFor = serviceKeyBase(plain);
        continue;
      }

      save();
      key = plain;
      body = [];
      awaitingTopicFor = "";
      continue;
    }

    if (awaitingTopicFor && plain && !/неразрывные\s+пробелы/iu.test(plain)) {
      topics[awaitingTopicFor] = formatInline(plain);
      awaitingTopicFor = "";
      continue;
    }

    if (/неразрывные\s+пробелы/iu.test(plain)) continue;
    if (key) body.push(raw);
  }

  save();

  if (!sections.length && text.trim()) {
    sections.push({ key: "output", topic: "", body: normalizeButtonBlocks(text) });
  }

  return sections.map((section) => ({
    ...section,
    topic: section.topic || topics[section.key] || "",
  }));
}

function bodyForSite(text, target) {
  const lines = normalizeButtonBlocks(text).split("\n");
  const out = [];
  let scope = "old";

  for (const line of lines) {
    const marker = siteMarker(line);
    if (marker) {
      scope = marker;
      continue;
    }

    if (isButtonLine(line)) {
      if (scope === target) out.push(line);
      scope = "old";
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

function normalizeTextChunk(text) {
  return stripServiceLines(text)
    .replace(/\r\n?/g, "\n")
    .replace(/\s*Междустрочный интервал\s*/giu, "\n__BRBR__\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function numberedParts(text) {
  const matches = [...text.matchAll(/(?:^|\s)(\d+)[.)]\s+/g)];
  if (!matches.length) return null;

  const first = matches[0];
  const intro = text.slice(0, first.index).trim();
  const items = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    return text.slice(start, end).trim();
  }).filter(Boolean);

  if (!items.length) return null;
  return { intro, items };
}

function buildTable(lines) {
  const rows = lines.map((line) => line.split("|").map((cell) => formatInline(cell.trim())).filter(Boolean));
  if (rows.length < 2 || rows.some((row) => row.length < 2)) return null;

  const cellStyle = "border: 1px solid #000; padding: 10px; text-align: center;";
  const body = rows.map((row, index) => {
    const tag = index === 0 ? "th" : "td";
    const cells = row.map((cell) => `    <${tag} style="${cellStyle}">${cell}</${tag}>`).join("\n");
    return `  <tr>\n${cells}\n  </tr>`;
  }).join("\n");

  return `<table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;">\n${body}\n</table>`;
}

function parseTextChunk(text) {
  const normalized = normalizeTextChunk(text);
  if (!normalized) return [];

  const segments = [];
  const lines = normalized.split(/\n+/);
  let tableBuffer = [];
  let listBuffer = null;

  function flushTable() {
    if (!tableBuffer.length) return;
    const table = keepTables.checked ? buildTable(tableBuffer) : null;
    if (table) segments.push({ type: "block", html: table });
    else tableBuffer.forEach((line) => segments.push({ type: "line", html: formatInline(line) }));
    tableBuffer = [];
  }

  function flushList() {
    if (!listBuffer) return;
    const items = listBuffer.items.map((item) => `<li>${formatInline(item)}</li>`).join("\n");
    segments.push({ type: "block", html: `<${listBuffer.type}>\n${items}\n</${listBuffer.type}>` });
    listBuffer = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line === "__BRBR__") {
      flushTable();
      flushList();
      segments.push({ type: "break" });
      continue;
    }

    if (keepTables.checked && line.includes("|")) {
      flushList();
      tableBuffer.push(line);
      continue;
    }

    flushTable();

    const numbered = numberedParts(line);
    if (keepLists.checked && numbered) {
      flushList();
      if (numbered.intro) segments.push({ type: "line", html: formatInline(numbered.intro) });
      const items = numbered.items.map((item) => `<li>${formatInline(item)}</li>`).join("\n");
      segments.push({ type: "block", html: `<ol>\n${items}\n</ol>` });
      continue;
    }

    const listItem = line.match(/^[-*•]\s+(.+)$/u);
    if (keepLists.checked && listItem) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(listItem[1]);
      continue;
    }

    flushList();
    segments.push({ type: "line", html: formatInline(line) });
  }

  flushTable();
  flushList();
  return segments;
}

function extractSegments(input) {
  const buttonPattern = /(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s+button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s+button)\s*:\s*([^\n(]+?)\s*\(((?:https?:\/\/|\/)[^)]+)\)/giu;
  const segments = [];
  let lastIndex = 0;
  let pendingButtons = [];

  function pushText(text) {
    const parsed = parseTextChunk(text);
    if (parsed.length) {
      flushButtons();
      segments.push(...parsed);
    }
  }

  function flushButtons() {
    if (!pendingButtons.length) return;
    const green = pendingButtons.find((button) => button.color === "green");
    const white = pendingButtons.find((button) => button.color === "white");
    segments.push({ type: "button", buttons: [green, white].filter(Boolean) });
    pendingButtons = [];
  }

  for (const match of input.matchAll(buttonPattern)) {
    const between = input.slice(lastIndex, match.index);
    const color = buttonColorFromMarker(match[1]);

    if (between.trim()) pushText(between);
    else if (segments.length && pendingButtons.length === 0) flushButtons();

    pendingButtons.push(parseButton(match[0], color, match[2], match[3]));
    lastIndex = match.index + match[0].length;
  }

  const tail = input.slice(lastIndex);
  if (tail.trim()) pushText(tail);
  flushButtons();

  return segments;
}

function colorKindFromCss(value) {
  const css = String(value || "").toLowerCase();
  if (!css) return null;

  const rgb = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    const [, rText, gText, bText] = rgb;
    const r = Number(rText);
    const g = Number(gText);
    const b = Number(bText);
    if (g > 90 && g > r * 1.25 && g > b * 1.25) return "green";
    if (r > 235 && g > 235 && b > 235) return "white";
  }

  if (/(^|[^a-z])(green|lime|#07974d|#01b462|#008000|#00a000|#00b050)([^a-z]|$)/.test(css)) return "green";
  if (/(^|[^a-z])(white|#fff|#ffffff)([^a-z]|$)/.test(css)) return "white";
  return null;
}

function nodeColorKind(node) {
  let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  while (current) {
    const inline = [
      current.getAttribute("style"),
      current.getAttribute("color"),
      current.getAttribute("bgcolor"),
      current.className,
    ].join(" ");
    const kind = colorKindFromCss(inline);
    if (kind) return kind;
    current = current.parentElement;
  }
  return null;
}

function collectRichPasteLines(root) {
  const lines = [];

  function pushLine(text, color) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return;
    lines.push({ text: clean, color });
  }

  function walkBlock(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let text = "";
    const colors = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.textContent || "";
      if (!value.trim()) continue;
      text += value;
      const kind = nodeColorKind(node);
      if (kind) colors.push(kind);
    }

    const color = colors.find((kind) => kind === "green") || colors.find((kind) => kind === "white") || null;
    pushLine(text, color);
  }

  const blocks = root.querySelectorAll("p, div, li, tr, h1, h2, h3, h4, h5, h6");
  if (blocks.length) {
    blocks.forEach(walkBlock);
  } else {
    pushLine(root.textContent || "", nodeColorKind(root));
  }

  return lines;
}

function htmlPasteToPlainText(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const lines = collectRichPasteLines(template.content);

  return lines.map(({ text, color }) => {
    if (!color) return text;
    const hasButtonUrl = /\(((?:https?:\/\/|\/)[^)]+)\)/i.test(text);
    const hasExplicitButton = /кнопка|button/i.test(text);
    const hasExplicitColor = /зел[её]ная|белая|green|white/i.test(text);

    if (hasButtonUrl && hasExplicitButton && !hasExplicitColor) {
      return `${color === "green" ? "Зеленая кнопка" : "Белая кнопка"}: ${text.replace(/^кнопка\s*:?\s*/iu, "")}`;
    }

    return text;
  }).join("\n");
}

window.htmlPasteToPlainText = htmlPasteToPlainText;

function normalizeDocxHtml(html) {
  let text = String(html || "");

  text = text.replace(/&amp;/g, "&");
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const url = href.replace(/&amp;/g, "&");
    const label = inner.replace(/<[^>]+>/g, "").trim();
    if (!label || label === url) return url;
    return `${label} (${url})`;
  });

  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<em>/gi, "<i>")
    .replace(/<\/em>/gi, "</i>")
    .replace(/<h[1-6][^>]*>/gi, "<b>")
    .replace(/<\/h[1-6]>/gi, "</b>\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<(?!\/?(?:b|i)\b)[^>]+>/gi, "");

  return normalizeButtonBlocks(text);
}

function makeButtonHtml(version, buttons) {
  if (!buttons.length) return "";

  const green = buttons.find((button) => button.color === "green");
  const white = buttons.find((button) => button.color === "white");
  const safeText = (value) => applyNbsp(restoreAllowedTags(escapeHtml(value)));

  if (!green && white) {
    if (version === "compact") {
      return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 140px; height: 25px; padding: 0 12px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D;">\n    ${safeText(white.text)}\n  </a>\n</div>`;
    }

    if (version === "mobile") {
      return `<div style="display: flex; flex-direction: column;">\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D; transform: rotate(0deg);">\n    ${safeText(white.text)}\n  </a>\n</div>`;
    }

    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${white.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: transparent; color: #01B462; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: 2px solid #01B462;">\n    ${safeText(white.text)}\n  </a>\n\n</div>`;
  }

  if (!white) {
    if (version === "compact") {
      return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 140px; height: 25px; padding: 0 12px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none;">\n    ${safeText(green.text)}\n  </a>\n</div>`;
    }

    if (version === "mobile") {
      return `<div style="display: flex; flex-direction: column;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none; transform: rotate(0deg);">\n    ${safeText(green.text)}\n  </a>\n</div>`;
    }

    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${green.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: #01B462; color: #FFFFFF; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n</div>`;
  }

  if (version === "compact") {
    return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 140px; height: 25px; padding: 0 12px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 140px; height: 25px; padding: 0 12px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D;">\n    ${safeText(white.text)}\n  </a>\n</div>`;
  }

  if (version === "mobile") {
    return `<div style="display: flex; flex-direction: column;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none; transform: rotate(0deg);">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px; margin-top: 6px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D; transform: rotate(0deg);">\n    ${safeText(white.text)}\n  </a>\n</div>`;
  }

  return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${green.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: #01B462; color: #FFFFFF; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: transparent; color: #01B462; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: 2px solid #01B462;">\n    ${safeText(white.text)}\n  </a>\n\n</div>`;
}

function renderSegments(version, segments) {
  const rendered = [];

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const next = segments[index + 1];

    if (segment.type === "break") {
      if (!String(rendered[rendered.length - 1] || "").includes("<br><br>")) rendered.push("\n\n<br><br>\n\n");
      continue;
    }

    const html = segment.type === "button" ? makeButtonHtml(version, segment.buttons) : segment.html;
    if (!html) continue;

    const previous = segments[index - 1];
    const separator = previous?.type === "line" && segment.type === "line" ? "<br>\n" : "\n\n";
    if (rendered.length && rendered[rendered.length - 1] !== "<br><br>") rendered.push(separator);
    rendered.push(html);
  }

  return rendered.join("").replace(/\n{3,}/g, "\n\n").trim();
}

function renderKeyTabs() {
  if (!parsedNotifications.length) {
    keyTabs.innerHTML = '<span class="key-empty">Ключи появятся после преобразования</span>';
    return;
  }

  keyTabs.innerHTML = parsedNotifications.map((section, index) => (
    `<button class="key-tab${index === activeNotificationIndex ? " active" : ""}" type="button" data-key-index="${index}" title="${escapeHtml(section.key)}">${escapeHtml(keyLabel(section.key))}</button>`
  )).join("");
}

function renderCurrentNotification() {
  const section = parsedNotifications[activeNotificationIndex];

  if (!section) {
    Object.values(outputs).forEach((output) => { output.value = ""; });
    updatePreview();
    return;
  }

  outputs.topic.value = section.topic || "";

  const oldSegments = extractSegments(bodyForSite(section.body, "old"));
  const redesignSegments = extractSegments(bodyForSite(section.body, "redesign"));

  outputs.compact.value = renderSegments("compact", oldSegments);
  outputs.mobile.value = renderSegments("mobile", oldSegments);
  outputs.pc.value = renderSegments("pc", redesignSegments.length ? redesignSegments : oldSegments);

  updatePreview();
}

function convert() {
  parsedNotifications = parseNotifications(sourceText.value);
  activeNotificationIndex = 0;
  renderKeyTabs();
  renderCurrentNotification();
}

function activeVersion() {
  return document.querySelector(".tab.active").dataset.tab;
}

function updatePreview() {
  preview.innerHTML = previewHtml(outputs[activeVersion()].value || "");
}

function previewHtml(html) {
  return html
    .replace(/\n\s*(?=<\/?(?:div|a|ol|ul|li|table|tr|td|th)\b)/g, "")
    .replace(/(<\/?(?:div|a|ol|ul|li|table|tr|td|th)[^>]*>)\s*\n/g, "$1")
    .replace(/\n{2,}/g, "\n");
}

function setSourceText(value) {
  sourceText.value = value;
  if (autoConvert.checked) convert();
}

function appendSourceText(value) {
  const start = sourceText.selectionStart ?? sourceText.value.length;
  const end = sourceText.selectionEnd ?? sourceText.value.length;
  sourceText.setRangeText(value, start, end, "end");
  if (autoConvert.checked) convert();
}

async function readDroppedFile(file) {
  if (/\.docx$/i.test(file.name)) {
    if (typeof mammoth === "undefined") {
      window.alert("Не удалось загрузить .docx: Mammoth.js недоступен.");
      return;
    }

    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    setSourceText(normalizeDocxHtml(result.value));
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const raw = String(reader.result || "");
    setSourceText(/\.html?$/i.test(file.name) ? htmlPasteToPlainText(raw) : raw);
  });
  reader.readAsText(file);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".result").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("active");
    updatePreview();
  });
});

keyTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-key-index]");
  if (!button) return;
  activeNotificationIndex = Number(button.dataset.keyIndex);
  renderKeyTabs();
  renderCurrentNotification();
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const version = button.dataset.copy;
    await navigator.clipboard.writeText(outputs[version].value);
    const oldText = button.textContent;
    button.textContent = "Скопировано";
    setTimeout(() => {
      button.textContent = oldText;
    }, 1200);
  });
});

convertBtn.addEventListener("click", convert);
sourceText.addEventListener("paste", (event) => {
  const html = event.clipboardData?.getData("text/html");
  if (!html) return;

  const markedText = htmlPasteToPlainText(html);
  if (!markedText.trim()) return;

  event.preventDefault();
  const start = sourceText.selectionStart;
  const end = sourceText.selectionEnd;
  sourceText.setRangeText(markedText, start, end, "end");
  if (autoConvert.checked) convert();
});
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});
["dragleave", "dragend", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.remove("drag-over");
  });
});
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();

  const file = event.dataTransfer?.files?.[0];
  if (file) {
    readDroppedFile(file).catch((error) => {
      window.alert(`Не удалось прочитать файл: ${error.message}`);
    });
    return;
  }

  const html = event.dataTransfer?.getData("text/html");
  const text = html ? htmlPasteToPlainText(html) : event.dataTransfer?.getData("text/plain");
  if (text) appendSourceText(text);
});
sourceText.addEventListener("input", () => {
  if (autoConvert.checked) convert();
});
keepLists.addEventListener("change", convert);
keepTables.addEventListener("change", convert);
Object.values(outputs).forEach((output) => {
  output.addEventListener("input", updatePreview);
});

sourceText.value = `Солидный бонус за депозит от 10 BYN: 1. В течение 3 дней нажмите кнопку «Участвовать» на странице предложения. 2. Пополните игровой счёт на сумму от 10 BYN. 3. Получите 200 фриспинов в игре Wisdom of Athena 1000 от Pragmatic Play. Междустрочный интервал Кнопка зеленая: За бонусом (/promotions/promotion/401?utm_medium=an&utm_source=crm&utm_campaign=MCMS-281401~MED&utm_term=Promo&utm_content=bel) Междустрочный интервал Прокрутите фриспины в течение 2 дней, отыграйте выигрыш с них 30 раз и переводите до 250 BYN на основной баланс!`;
convert();
