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
  pcMb6r: document.querySelector("#pcMb6rOutput"),
};
const keyTabs = document.querySelector("#keyTabs");
const copyKeyBtn = document.querySelector("#copyKeyBtn");
const copyTopicKeyBtn = document.querySelector("#copyTopicKeyBtn");
const guideBtn = document.querySelector("#guideBtn");
const guideModal = document.querySelector("#guideModal");
const guideCloseBtn = document.querySelector("#guideCloseBtn");
const preview = document.querySelector("#preview");
const authGate = document.querySelector("#authGate");
const appShell = document.querySelector("#appShell");
const authForm = document.querySelector("#authForm");
const authPassword = document.querySelector("#authPassword");
const authError = document.querySelector("#authError");
let parsedNotifications = [];
let activeNotificationIndex = 0;
const accessPassword = "0558";
const accessSessionKey = "locform-auth-ok";

const stableNames = [
  "Drops & Wins",
  "Pragmatic Play",
  "Gates of Olympus 1000",
  "Wisdom of Athena 1000",
  "Big Bass Bonanza 1000",
  "Giros Gratis",
  "Ruedas de Premios Semanales",
];
let dynamicStableNames = [];

const nbspMarkerRe = /\u043d\u0435\u0440\u0430\u0437\u0440\u044b\u0432\u043d\u044b\u0435\s+\u043f\u0440\u043e\u0431\u0435\u043b\u044b/iu;

function refreshDynamicStableNames(text) {
  const seen = new Set(stableNames.map((name) => name.toLowerCase()));
  const names = [];

  String(text || "").split("\n").forEach((line) => {
    const plain = stripTags(line).replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (!nbspMarkerRe.test(plain)) return;

    const [, rest = ""] = plain.split(/:(.*)/s);
    rest.split(",").forEach((part) => {
      const name = part.replace(/\s+/g, " ").trim();
      if (name.length < 2 || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      names.push(name);
    });
  });

  dynamicStableNames = names;
}

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
    .replace(/&lt;(\/?)u&gt;/g, "<$1u>")
    .replace(/&lt;a href="([^"]+)" target="_blank"&gt;/g, (_, href) => `<a href="${href.replace(/&amp;/g, "&")}" target="_blank">`)
    .replace(/&lt;a href="([^"]+)"&gt;/g, (_, href) => `<a href="${href.replace(/&amp;/g, "&")}">`)
    .replace(/&lt;\/a&gt;/g, "</a>")
    .replace(/&lt;br&gt;/g, "<br>")
    .replace(/&lt;br\/&gt;/g, "<br>");
}

function absoluteInlineHref(href) {
  const value = String(href || "").replace(/&amp;/g, "&").trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\/casino\/categories\//i.test(value)) return `https://new.marathonbet.com/es${value}`;
  if (value.startsWith("/")) return `https://new.marathonbet.com${value}`;
  return value;
}

function inlineLinkHtml(href, label) {
  const safeHref = absoluteInlineHref(href).replace(/"/g, "%22");
  const cleanLabel = String(label || "").replace(/<[^>]+>/g, "").trim();
  if (!cleanLabel || cleanLabel === safeHref) return safeHref;
  if (/^(?:https?:\/\/|\/)\S+$/i.test(cleanLabel)) return safeHref;
  return `<a href="${safeHref}" target="_blank"><i><u>${cleanLabel}</u></i></a>`;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanUrl(raw) {
  return String(raw || "")
    .trim()
    .replace(/^\(+/, "")
    .replace(/\)+$/, "")
    .replace(/\s*&\s*/g, "&")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s+/g, "");
}

function cleanMatchedUrl(raw) {
  return cleanUrl(String(raw || "").replace(/\)+$/g, ""));
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "").trim();
}

function stripTagsWithSpaces(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function plainOutputText(value) {
  return stripTagsWithSpaces(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeInputText(value) {
  const siteWords = "(?:old\\s*site|oldsite|old\\s*version|oldversion|старый\\s*сайт|redesign\\s*site|redesignsite|redesign|new\\s*site|newsite|new\\s*version|newversion|редизайн|новый\\s*сайт)";
  const buttonWords = "(?:Кнопка\\s*зел[её]ная|Зел[её]ная\\s+кнопка|Button\\s*green|Green\\s*button|Кнопка\\s*белая|Белая\\s+кнопка|Button\\s*white|White\\s*button)";
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/(^|\n)\s*(?:<\/[bi]>\s*)+/gi, "$1")
    .replace(new RegExp(`([^\\n])\\s*((?:<[^>]+>\\s*)*${buttonWords}(?:\\s*<\\/[^>]+>)*)\\s*(?=\\n|$)`, "giu"), "$1\n$2")
    .replace(new RegExp(`((?:https?:\\/\\/|\\/)[^\\n\\s]+?)(?=${buttonWords}\\s*:?)`, "giu"), "$1\n")
    .replace(new RegExp(`(${siteWords})(?=\\s*(?:Кнопка|Button|Green\\s*button|White\\s*button|Зел[её]ная\\s+кнопка|Белая\\s+кнопка))`, "giu"), "$1\n")
    .replace(new RegExp(`(\\([^)]+\\))\\s*(${siteWords})`, "giu"), "$1\n$2")
    .replace(new RegExp(`(https?:\\/\\/[^\\n\\s]+|\\/[^\\n\\s)]+)\\n(?!${siteWords}|${buttonWords}\\s*:?|message\\.service|18\\+)([?&=/#\\w-])`, "giu"), "$1$2");
}

function siteMarker(line) {
  const plain = stripTagsWithSpaces(line).toLowerCase();
  const compact = plain.replace(/[\s._-]+/g, "");
  if (compact === "oldsite" || compact === "oldversion" || compact === "старыйсайт") return "old";
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

function splitSitePrefix(line) {
  const plain = stripTagsWithSpaces(line);
  const lower = plain.toLowerCase();
  const aliases = [
    ["redesign site", "redesign"],
    ["redesignsite", "redesign"],
    ["new version", "redesign"],
    ["newversion", "redesign"],
    ["new site", "redesign"],
    ["newsite", "redesign"],
    ["redesign", "redesign"],
    ["old version", "old"],
    ["oldversion", "old"],
    ["old site", "old"],
    ["oldsite", "old"],
  ];

  for (const [alias, marker] of aliases) {
    if (lower.startsWith(alias)) {
      return { marker, rest: plain.slice(alias.length).trim() };
    }
  }

  return null;
}

function isButtonLine(line) {
  return /^(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s*button)\s*:/iu.test(stripTagsWithSpaces(line));
}

function splitSitePrefixedButton(line) {
  const plain = stripTagsWithSpaces(line);
  const compact = plain.toLowerCase().replace(/[\s._-]+/g, "");
  const oldPrefixes = ["oldsite", "oldversion", "старыйсайт"];
  const redesignPrefixes = ["redesignsite", "redesign", "newsite", "newversion", "редизайн", "новыйсайт"];
  const marker = oldPrefixes.some((prefix) => compact.startsWith(prefix))
    ? "old"
    : redesignPrefixes.some((prefix) => compact.startsWith(prefix))
      ? "redesign"
      : "";
  if (!marker) return null;

  const button = plain.match(/(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s*button)\s*:/iu);
  if (!button || button.index === 0) return null;

  return { marker, button: plain.slice(button.index).trim() };
}

function matchButtonMarker(line) {
  return stripTagsWithSpaces(line).match(/^(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s*button)\s*:?\s*(.*)$/iu);
}

function parseButtonBlockAt(lines, index) {
  const marker = matchButtonMarker(lines[index] || "");
  if (!marker) return null;

  const markerLabel = marker[1];
  let labelText = marker[2].trim();
  let cursor = index + 1;

  if (!labelText) {
    while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;
    const candidate = stripTags(lines[cursor] || "");
    if (!candidate || /^\(?((?:https?:\/\/|\/)[^)]+)\)?$/iu.test(candidate) || siteMarker(candidate) || splitSitePrefix(candidate)) return null;
    labelText = candidate;
    cursor += 1;
  }

  while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;
  const urlCandidate = stripTags(lines[cursor] || "");
  const urlMatch = urlCandidate.match(/^\(?((?:https?:\/\/|\/)[^)]+)\)?$/iu);
  if (!urlMatch) return null;

  const url = cleanUrl(urlMatch[1]);
  return {
    marker: markerLabel,
    text: labelText,
    url,
    inline: `${markerLabel}: ${labelText} (${url})`,
    nextIndex: cursor + 1,
  };
}

function splitSitePrefixLoose(line) {
  const site = splitSitePrefix(line);
  if (!site) return null;

  return {
    marker: site.marker,
    rest: site.rest.replace(/^[:：]\s*/, "").trim(),
  };
}

function matchedUrls(value) {
  return (String(value || "").match(/(?:https?:\/\/|\/)\S+/giu) || []).map((url) => cleanMatchedUrl(url));
}

function parseButtonScopedUrlsAt(lines, index) {
  const marker = matchButtonMarker(lines[index] || "");
  if (!marker) return null;

  const markerLabel = marker[1];
  const buttonText = marker[2].trim();
  if (!buttonText) return null;

  const variants = [];
  let cursor = index + 1;

  while (cursor < lines.length) {
    while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;

    const site = splitSitePrefixLoose(lines[cursor] || "");
    if (!site) break;

    let urls = matchedUrls(site.rest);
    let consumedLines = 1;

    if (!urls.length) {
      urls = matchedUrls(stripTags(lines[cursor + 1] || ""));
      if (urls.length) consumedLines = 2;
    }

    if (!urls.length) break;

    if (site.marker === "redesign" && urls.length >= 2) {
      variants.push({ marker: "redesign", url: urls[0] });
      variants.push({ marker: "old", url: urls[1] });
    } else {
      variants.push({ marker: site.marker, url: urls[0] });
    }

    cursor += consumedLines;
  }

  if (!variants.length) return null;
  return {
    marker: markerLabel,
    text: buttonText,
    variants,
    nextIndex: cursor,
  };
}

function normalizeButtonBlocks(value) {
  const lines = normalizeInputText(value).split("\n");
  const out = [];
  let index = 0;

  function splitMultipleUrls(value) {
    const matches = String(value || "").match(/(?:https?:\/\/|\/)\S+/giu) || [];
    return matches.map((match) => cleanUrl(match));
  }

  function pushExpandedButton(label, text, url) {
    out.push(`${label}:`);
    out.push(text);
    out.push(`(${cleanUrl(url)})`);
  }

  function parseEmbeddedSiteUrlLine(value) {
    const plain = stripTagsWithSpaces(value);
    const urlMatch = plain.match(/(?:https?:\/\/|\/)\S+/i);
    if (!urlMatch) return null;

    const beforeUrl = plain.slice(0, urlMatch.index).trim();
    const url = cleanUrl(urlMatch[0]);
    const sitePatterns = [
      { re: /redesign\s*site/iu, marker: "redesign" },
      { re: /new\s*version/iu, marker: "redesign" },
      { re: /new\s*site/iu, marker: "redesign" },
      { re: /redesign/iu, marker: "redesign" },
      { re: /old\s*version/iu, marker: "old" },
      { re: /old\s*site/iu, marker: "old" },
    ];

    let bestMatch = null;
    for (const pattern of sitePatterns) {
      const match = pattern.re.exec(beforeUrl);
      if (!match) continue;
      if (!bestMatch || match.index > bestMatch.index) {
        bestMatch = { index: match.index, marker: pattern.marker };
      }
    }

    if (!bestMatch) return null;

    const label = beforeUrl.slice(0, bestMatch.index).trim();
    if (!label) return null;
    return { label, marker: bestMatch.marker, url };
  }

  function buildButtonLine(label, rest, nextLine) {
    const cleanRest = stripTags(rest);
    const inlineUrl = cleanRest.match(/^(.+?)\s+\(((?:https?:\/\/|\/)[\s\S]+?)\)?\s*$/iu);
    if (inlineUrl) {
      return { text: inlineUrl[1].trim(), url: cleanUrl(inlineUrl[2]), consumedNext: false };
    }

    const inlinePlainUrl = cleanRest.match(/^(.+?)\s+((?:https?:\/\/|\/)\S+)\s*$/iu);
    if (inlinePlainUrl) {
      return { text: inlinePlainUrl[1].trim(), url: cleanUrl(inlinePlainUrl[2]), consumedNext: false };
    }

    const url = stripTags(nextLine || "");
    if (cleanRest && /^\(?((?:https?:\/\/|\/)[^)]+)\)?$/iu.test(url)) {
      return { text: cleanRest, url: cleanUrl(url), consumedNext: true };
    }

    return null;
  }

  function urlOnlyLine(value) {
    const match = stripTags(value || "").match(/^\(?((?:https?:\/\/|\/)[^)]+)\)?$/iu);
    return match ? cleanMatchedUrl(match[1]) : "";
  }

  function pushSiteButton(label, site, next, fallbackText = "") {
    const canonicalMarker = site.marker === "old" ? "Old version" : "redesign";
    const siteRest = String(site.rest || "").replace(/^[:：]\s*/, "").trim();

    if (!siteRest && next < lines.length) {
      let labelIndex = next;
      while (labelIndex < lines.length && !stripTags(lines[labelIndex])) labelIndex += 1;
      if (labelIndex >= lines.length) return null;

      const built = buildButtonLine(label, lines[labelIndex], lines[labelIndex + 1]);
      if (!built) {
        const inheritedUrl = fallbackText ? urlOnlyLine(lines[labelIndex]) : "";
        if (!inheritedUrl) return null;

        out.push(canonicalMarker);
        pushExpandedButton(label, fallbackText, inheritedUrl);
        return { nextIndex: labelIndex + 1, text: fallbackText };
      }

      out.push(canonicalMarker);
      pushExpandedButton(label, built.text, built.url);
      return { nextIndex: labelIndex + (built.consumedNext ? 2 : 1), text: built.text };
    }

    const built = buildButtonLine(label, siteRest, lines[next]);
    if (!built) return null;

    out.push(canonicalMarker);
    pushExpandedButton(label, built.text, built.url);
    return { nextIndex: next + (built.consumedNext ? 1 : 0), text: built.text };
  }

  function pushLabeledSiteButtons(label, buttonText, startIndex) {
    let cursor = startIndex;
    let consumedAny = false;

    while (cursor < lines.length) {
      while (cursor < lines.length && !stripTags(lines[cursor])) cursor += 1;

      const site = splitSitePrefix(lines[cursor] || "");
      if (!site) break;

      let urls = splitMultipleUrls(site.rest);
      let consumedLines = 1;

      if (!urls.length) {
        let urlIndex = cursor + 1;
        while (urlIndex < lines.length && !stripTags(lines[urlIndex])) urlIndex += 1;
        urls = splitMultipleUrls(stripTags(lines[urlIndex] || ""));
        if (urls.length) consumedLines = urlIndex - cursor + 1;
      }

      if (!urls.length) break;

      if (site.marker === "redesign" && urls.length >= 2) {
        out.push("redesign");
        pushExpandedButton(label, buttonText, urls[0]);
        out.push("Old version");
        pushExpandedButton(label, buttonText, urls[1]);
      } else {
        out.push(site.marker === "old" ? "Old version" : "redesign");
        pushExpandedButton(label, buttonText, urls[0]);
      }

      cursor += consumedLines;
      consumedAny = true;
    }

    return consumedAny ? cursor : null;
  }

  while (index < lines.length) {
    const line = lines[index];
    const plain = stripTags(line);
    const bareMarker = plain.match(/^(?:Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s*button)\s*$/iu);
    if (bareMarker) {
      const embedded = parseEmbeddedSiteUrlLine(lines[index + 1] || "");
      if (embedded) {
        out.push(embedded.marker === "old" ? "Old version" : "redesign");
        pushExpandedButton(plain, embedded.label, embedded.url);
        const consumed = pushLabeledSiteButtons(plain, embedded.label, index + 2);
        index = consumed !== null ? consumed : index + 2;
        continue;
      }

      const labelLine = stripTags(lines[index + 1] || "");
      const site = splitSitePrefix(lines[index + 2] || "");
      const urlLine = stripTags(lines[index + 3] || "");
      const urls = splitMultipleUrls(urlLine);

      if (labelLine && site?.marker === "redesign" && urls.length >= 2) {
        out.push("redesign");
        pushExpandedButton(plain, labelLine, urls[0]);
        out.push("Old version");
        pushExpandedButton(plain, labelLine, urls[1]);
        index += 4;
        continue;
      }

      if (labelLine) {
        const consumed = pushLabeledSiteButtons(plain, labelLine, index + 2);
        if (consumed !== null) {
          index = consumed;
          continue;
        }
      }
    }
    const marker = plain.match(/^(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s*button)\s*:?\s*(.*)$/iu);

    if (!marker) {
      out.push(line);
      index += 1;
      continue;
    }

    const label = marker[1];
    let rest = marker[2].trim();
    let next = index + 1;
    let consumedSiteButtons = false;
    let inheritedSiteButtonText = "";

    const prefixedRest = splitSitePrefix(rest);
    if (prefixedRest) {
      const consumed = pushSiteButton(label, prefixedRest, next);
      if (consumed !== null) {
        index = consumed.nextIndex;
        inheritedSiteButtonText = consumed.text;
        consumedSiteButtons = true;
      }
    } else {
      const built = buildButtonLine(label, rest, lines[next]);
      if (built) {
        pushExpandedButton(label, built.text, built.url);
        index += built.consumedNext ? 2 : 1;
        continue;
      }
    }

    while (consumedSiteButtons) {
      while (index < lines.length && !stripTags(lines[index])) index += 1;
      const site = splitSitePrefix(lines[index]);
      if (!site) break;
      const consumed = pushSiteButton(label, site, index + 1, inheritedSiteButtonText);
      if (consumed === null) break;
      index = consumed.nextIndex;
      inheritedSiteButtonText = consumed.text || inheritedSiteButtonText;
    }

    if (consumedSiteButtons) {
      continue;
    }

    while (next < lines.length && !stripTags(lines[next])) next += 1;

    if (!rest && next < lines.length) {
      const embedded = parseEmbeddedSiteUrlLine(lines[next] || "");
      if (embedded) {
        out.push(embedded.marker === "old" ? "Old version" : "redesign");
        pushExpandedButton(label, embedded.label, embedded.url);
        const consumed = pushLabeledSiteButtons(label, embedded.label, next + 1);
        index = consumed !== null ? consumed : next + 1;
        continue;
      }

      const labelText = stripTags(lines[next]);
      if (labelText && !splitSitePrefix(lines[next])) {
        const consumed = pushLabeledSiteButtons(label, labelText, next + 1);
        if (consumed !== null) {
          index = consumed;
          continue;
        }
      }

      const site = splitSitePrefix(lines[next]);
      if (site) {
        const siteUrlLine = stripTags(lines[next + 1] || "");
        const siteUrls = splitMultipleUrls(siteUrlLine);
        if (site.marker === "redesign" && siteUrls.length >= 2) {
          out.push("redesign");
          pushExpandedButton(label, stripTags(lines[next]), siteUrls[0]);
          out.push("Old version");
          pushExpandedButton(label, stripTags(lines[next]), siteUrls[1]);
          index = next + 2;
          continue;
        }

        const consumed = pushSiteButton(label, site, next + 1);
        if (consumed !== null) {
          index = consumed.nextIndex;
          inheritedSiteButtonText = consumed.text;
          consumedSiteButtons = true;
          while (index < lines.length) {
            while (index < lines.length && !stripTags(lines[index])) index += 1;
            const repeatedSite = splitSitePrefix(lines[index]);
            if (!repeatedSite) break;
            const repeatedConsumed = pushSiteButton(label, repeatedSite, index + 1, inheritedSiteButtonText);
            if (repeatedConsumed === null) break;
            index = repeatedConsumed.nextIndex;
            inheritedSiteButtonText = repeatedConsumed.text || inheritedSiteButtonText;
          }
          continue;
        }
      }

      rest = stripTags(lines[next]);
      const built = buildButtonLine(label, rest, lines[next + 1]);
      if (built) {
        pushExpandedButton(label, built.text, built.url);
        index = next + (built.consumedNext ? 2 : 1);
        continue;
      }
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

function applyNbsp(value, includeDynamic = true) {
  let html = value;
  const amountPattern = "(?:\\d+(?:&nbsp;\\d{3})*(?:[,.]\\d+)?|\\d+(?:[,.]\\d+)?)";
  const currencyPattern = "(?:₽|руб\\.?|BYN|UZS|USD|EUR|AR\\$|US\\$|\\$|€)";
  const currencyFollow = "(?=$|[\\s<.,!?:;)])";

  html = html.replace(/\b(\d{1,3}(?:[ \u00a0]\d{3})+)\b/g, (match) => match.replace(/[ \u00a0]/g, "&nbsp;"));
  html = html.replace(new RegExp(`\\b(${amountPattern})(?:\\s|&nbsp;)+(${currencyPattern})${currencyFollow}`, "giu"), "$1&nbsp;$2");
  html = html.replace(new RegExp(`(${currencyPattern})(?:\\s|&nbsp;)+(${amountPattern})\\b`, "giu"), "$1&nbsp;$2");
  html = html.replace(/(\d+)\s+фриспинов/giu, "$1&nbsp;фриспинов");
  html = html.replace(new RegExp(`(^|[\\s>(])((?:от|до))(?:\\s|&nbsp;)+(${amountPattern}&nbsp;${currencyPattern})`, "giu"), "$1$2&nbsp;$3");
  html = html.replace(new RegExp(`(^|[\\s>(])((?:от|до))(?:\\s|&nbsp;)+(${currencyPattern}&nbsp;${amountPattern})`, "giu"), "$1$2&nbsp;$3");

  const names = includeDynamic ? [...stableNames, ...dynamicStableNames] : stableNames;
  for (const name of names) {
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

function normalizeBold(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/__(.+?)__/g, "<b>$1</b>");
}

function removeTinyBoldTags(value) {
  return String(value || "").replace(/<b>([\s\S]*?)<\/b>/gi, (match, inner) => {
    const plain = stripTags(inner).replace(/&nbsp;/g, " ").trim();
    return plain.length < 3 ? inner : match;
  });
}

function balanceInlineTags(value) {
  let html = String(value || "");

  ["b", "i", "u"].forEach((tag) => {
    const openRe = new RegExp(`<${tag}>`, "g");
    const closeRe = new RegExp(`</${tag}>`, "g");
    const opens = html.match(openRe)?.length || 0;
    const closes = html.match(closeRe)?.length || 0;

    if (closes > opens) {
      let extra = closes - opens;
      html = html.replace(closeRe, (match) => {
        if (extra <= 0) return match;
        extra -= 1;
        return "";
      });
    } else if (opens > closes) {
      html += `</${tag}>`.repeat(opens - closes);
    }
  });

  return html;
}

function formatInline(line) {
  const normalizedLine = String(line || "").replace(/[ \t]{2,}/g, " ").trim();
  const escaped = restoreAllowedTags(escapeHtml(removeTinyBoldTags(normalizeBold(normalizedLine))));
  return applyNbsp(balanceInlineTags(escaped));
}

function parseButton(matchText, color, label, url) {
  return {
    type: "button",
    color,
    text: String(label || "").replace(/[ \t]{2,}/g, " ").trim(),
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

function startsWithAgeWarning(line) {
  return stripTags(line).replace(/&nbsp;/g, " ").trim().startsWith("18+");
}

function startsWithFinalAgeWarning(line) {
  return /^18\+\s*[|│]/u.test(stripTags(line).replace(/&nbsp;/g, " ").trim());
}

function trimAfterAgeWarning(text) {
  const lines = String(text || "").split("\n");
  const index = lines.findIndex(startsWithFinalAgeWarning);
  return index === -1 ? lines.join("\n") : lines.slice(0, index + 1).join("\n");
}

function ensureAgeWarningBreak(text) {
  const lines = String(text || "").split("\n");
  let last = lines.length - 1;
  while (last >= 0 && !stripTags(lines[last])) last -= 1;
  if (last < 0 || !startsWithAgeWarning(lines[last])) return lines.join("\n");

  let previous = last - 1;
  while (previous >= 0 && !stripTags(lines[previous])) previous -= 1;
  if (previous >= 0 && lines[previous].trim() === "__BRBR__") return lines.join("\n");

  lines.splice(last, 0, "__BRBR__");
  return lines.join("\n");
}

function isServiceKeyLine(line) {
  const plain = stripTags(line);
  return /^message\.service(?:\.[a-z0-9_-]+)+$/i.test(plain);
}

function isDiscardedServiceLabel(line) {
  return /^(?:MB6R|MB3B|PC)$/i.test(plainOutputText(line));
}

function isLineBreakInstruction(line) {
  return /^\u041c\u0435\u0436(?:\u0434\u0443)?\u0441\u0442\u0440\u043e\u0447\u043d\u044b\u0439\s+(?:\u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b|\u043f\u0440\u043e\u0431\u0435\u043b)$/iu.test(plainOutputText(line));
}

function serviceKeyBase(key) {
  return key.replace(/\.topic$/i, "");
}

function languageHeader(line) {
  const plain = stripTags(line).replace(/\s+/g, " ").trim();
  const match = plain.match(/^(?:PC|COM|MOB|WEB|APP|AN)?\s*(ENG|EN|RUS|RU|UZB|UZ|KAZ|KZ|SPA|ESP|ES|ARG|LATAM|LAT|POR|PT|FRA|FR|GER|DE|TUR|TR|AZE|AZ|ARM|AM|GEO|KA|UKR|UA)\b/i);
  if (!match) return "";
  return match[1].toUpperCase();
}

function separateLanguageHeaders(value) {
  const out = [];
  let seenLanguageHeader = false;

  for (const line of String(value || "").split("\n")) {
    if (languageHeader(line)) {
      if (seenLanguageHeader && out.length && stripTagsWithSpaces(out[out.length - 1])) out.push("");
      seenLanguageHeader = true;
    }

    out.push(line);
  }

  return out.join("\n");
}

function isBareNumericServiceKey(key) {
  return /^message\.service\.\d+$/i.test(key);
}

function inferLanguageFromContent(value) {
  const text = plainOutputText(value).toLowerCase();
  if (!text) return "";
  if (/[а-яё]/iu.test(text)) return "RUS";
  if (/[¿¡ñáéíóúü]/iu.test(text) || /\b(?:pod[eé]s|jug[aá]|campeones|responsabilidad)\b/iu.test(text)) return "ARG";
  if (/(?:iltimos|batafsil|jahon|chempion|ishtirok|yapsiz|uchun|bilan|yo'l|o'|g')/iu.test(text)) return "UZB";
  if (/[a-z]/iu.test(text)) return "ENG";
  return "";
}

function topicKey(key, language) {
  return `${language || ""}|${key}`;
}

function keyLabel(section) {
  const key = section.key;
  const match = key.match(/^message\.service\.([a-z]{2,5})\.(\d+)$/i);
  const base = match ? `${match[1]}.${match[2]}` : key.replace(/^.*\.(\d+)$/, "$1");
  return section.language ? `${base} · ${section.language}` : base;
}

function parseNotifications(text) {
  refreshDynamicStableNames(text);
  const lines = normalizeButtonBlocks(text).split("\n");
  const sections = [];
  const topics = {};
  const topicQueues = {};
  let language = "";
  let key = "";
  let sectionLanguage = "";
  let sectionTopic = "";
  let body = [];
  let awaitingTopicFor = "";
  let awaitingTopicLanguage = "";

  function enqueueTopic(topicFor, topicLanguage, topicText) {
    if (!topicQueues[topicFor]) topicQueues[topicFor] = [];
    topicQueues[topicFor].push({ language: topicLanguage, topic: topicText });
    if (!topics[topicKey(topicFor, topicLanguage)]) topics[topicKey(topicFor, topicLanguage)] = topicText;
    if (!topicLanguage && !topics[topicKey(topicFor, "")]) topics[topicKey(topicFor, "")] = topicText;
  }

  function takeQueuedTopic(topicFor, preferredLanguage) {
    const queue = topicQueues[topicFor] || [];
    if (!queue.length) return null;

    const index = preferredLanguage
      ? queue.findIndex((item) => item.language === preferredLanguage || !item.language)
      : 0;
    if (index < 0) return null;

    return queue.splice(index, 1)[0];
  }

  function save() {
    if (!key) return;
    const effectiveLanguage = sectionLanguage || language;
    sections.push({
      key,
      language: effectiveLanguage,
      topic: sectionTopic || topics[topicKey(key, effectiveLanguage)] || topics[topicKey(key, "")] || "",
      body: body.join("\n").trim(),
    });
  }

  for (const raw of lines) {
    const plain = stripTags(raw);
    const nextLanguage = languageHeader(raw);

    if (isDiscardedServiceLabel(raw)) continue;
    if (isLineBreakInstruction(raw) && (awaitingTopicFor || (key && !body.some((line) => stripTagsWithSpaces(line))))) continue;

    if (nextLanguage) {
      if (key) save();
      language = nextLanguage;
      key = "";
      sectionLanguage = "";
      sectionTopic = "";
      body = [];
      awaitingTopicFor = "";
      awaitingTopicLanguage = "";
      continue;
    }

    if (isServiceKeyLine(raw)) {
      if (/\.topic$/i.test(plain)) {
        const baseKey = serviceKeyBase(plain);
        if (key) save();

        awaitingTopicFor = baseKey;
        awaitingTopicLanguage = language;
        key = "";
        sectionLanguage = "";
        sectionTopic = "";
        body = [];
        continue;
      }

      save();
      const queuedTopic = takeQueuedTopic(plain, language);
      key = plain;
      sectionLanguage = queuedTopic?.language || language;
      sectionTopic = queuedTopic?.topic || "";
      body = [];
      awaitingTopicFor = "";
      continue;
    }

    if (awaitingTopicFor && plain && !/неразрывные\s+пробелы/iu.test(plain)) {
      const inferredLanguage = awaitingTopicLanguage || (isBareNumericServiceKey(awaitingTopicFor) ? inferLanguageFromContent(raw) : "");
      enqueueTopic(awaitingTopicFor, inferredLanguage, plainOutputText(raw));
      awaitingTopicFor = "";
      awaitingTopicLanguage = "";
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
    topic: section.topic || topics[topicKey(section.key, section.language)] || topics[topicKey(section.key, "")] || "",
  }));
}

function bodyForSite(text, target) {
  const lines = normalizeButtonBlocks(text).split("\n");
  const out = [];
  let scope = "";
  let scopedButtonCluster = false;

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const prefixed = splitSitePrefixedButton(line);
    if (prefixed) {
      if (prefixed.marker === target) out.push(prefixed.button);
      scope = "";
      scopedButtonCluster = false;
      index += 1;
      continue;
    }

    const marker = siteMarker(line);
    if (marker) {
      scope = marker;
      scopedButtonCluster = true;
      index += 1;
      continue;
    }

    const scopedUrlsButton = parseButtonScopedUrlsAt(lines, index);
    if (scopedUrlsButton) {
      scopedUrlsButton.variants
        .filter((variant) => variant.marker === target)
        .forEach((variant) => {
          out.push(`${scopedUrlsButton.marker}: ${scopedUrlsButton.text} (${variant.url})`);
        });

      scope = "";
      scopedButtonCluster = false;
      index = scopedUrlsButton.nextIndex;
      continue;
    }

    const buttonBlock = parseButtonBlockAt(lines, index);
    if (buttonBlock) {
      if (scopedButtonCluster) {
        if (scope === target) out.push(buttonBlock.inline);
        scope = "";
        scopedButtonCluster = false;
        index = buttonBlock.nextIndex;
        continue;
      }

      out.push(buttonBlock.inline);
      index = buttonBlock.nextIndex;
      continue;
    }

    if (scopedButtonCluster && stripTagsWithSpaces(line)) {
      scope = "";
      scopedButtonCluster = false;
    }

    out.push(line);
    index += 1;
  }

  return out.join("\n");
}

function normalizeTextChunk(text) {
  const normalized = trimAfterAgeWarning(stripServiceLines(text)
    .replace(/\r\n?/g, "\n")
    .replace(/\s*Меж(?:ду)?строчный (?:интервал|пробел)\s*/giu, "\n__BRBR__\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim());

  return ensureAgeWarningBreak(normalized);
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
    segments.push({ type: "block", kind: "list", html: `<${listBuffer.type}>\n${items}\n</${listBuffer.type}>` });
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
      segments.push({ type: "block", kind: "list", html: `<ol>\n${items}\n</ol>` });
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
  const buttonPattern = /(Кнопка\s*зел[её]ная|Зел[её]ная\s+кнопка|Button\s*green|Green\s*button|Кнопка\s*белая|Белая\s+кнопка|Button\s*white|White\s*button)\s*:\s*([^\n(]+?)\s*\(((?:https?:\/\/|\/)[^)]+)\)/giu;
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
    segments.push({ type: "button", buttons: pendingButtons });
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

function wordColorKind(value) {
  const color = String(value || "").replace(/^#/, "").toLowerCase();
  if (!color || color === "auto") return null;
  if (color === "green" || /^(?:07974d|01b462|008000|00a000|00b050|92d050|70ad47)$/.test(color)) return "green";
  if (color === "white" || color === "ffffff") return "white";
  return null;
}

function xmlChildrenByLocalName(node, localName) {
  return [...node.getElementsByTagName("*")].filter((child) => child.localName === localName);
}

function xmlAttribute(node, localName) {
  if (!node) return "";
  return node.getAttribute(localName)
    || [...node.attributes].find((attribute) => attribute.localName === localName)?.value
    || "";
}

function runText(run) {
  return xmlChildrenByLocalName(run, "t").map((node) => node.textContent || "").join("");
}

function runHighlightColor(run) {
  const rPr = xmlChildrenByLocalName(run, "rPr")[0];
  if (!rPr) return null;

  const highlight = xmlChildrenByLocalName(rPr, "highlight")[0];
  const highlightColor = wordColorKind(xmlAttribute(highlight, "val"));
  if (highlightColor) return highlightColor;

  const shading = xmlChildrenByLocalName(rPr, "shd")[0];
  return wordColorKind(xmlAttribute(shading, "fill"));
}

function pushHighlightHint(hints, text, color) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean || !color) return;
  hints.push({ text: clean, color });
}

function pushInlineLinkHint(hints, text, href) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const cleanHref = String(href || "").trim();
  if (!clean || !cleanHref) return;
  hints.push({ text: clean, href: cleanHref });
}

function relationshipTargetMap(xmlText) {
  const map = {};
  if (!xmlText) return map;

  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  [...xml.getElementsByTagName("*")]
    .filter((node) => node.localName === "Relationship")
    .forEach((node) => {
      const id = node.getAttribute("Id");
      const target = node.getAttribute("Target");
      if (id && target) map[id] = target;
    });

  return map;
}

async function extractDocxHighlightHints(arrayBuffer) {
  if (typeof JSZip === "undefined") return [];

  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) return [];

  const xmlText = await documentFile.async("string");
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const paragraphs = [...xml.getElementsByTagName("*")].filter((node) => node.localName === "p");
  const hints = [];

  paragraphs.forEach((paragraph) => {
    const combined = { green: "", white: "" };
    let activeColor = null;
    let activeText = "";

    xmlChildrenByLocalName(paragraph, "r").forEach((run) => {
      const text = runText(run);
      const color = runHighlightColor(run);
      if (!text) return;

      if (color === "green" || color === "white") {
        combined[color] += text;
        if (activeColor === color) activeText += text;
        else {
          pushHighlightHint(hints, activeText, activeColor);
          activeColor = color;
          activeText = text;
        }
        return;
      }

      pushHighlightHint(hints, activeText, activeColor);
      activeColor = null;
      activeText = "";
    });

    pushHighlightHint(hints, activeText, activeColor);
    pushHighlightHint(hints, combined.green, "green");
    pushHighlightHint(hints, combined.white, "white");
  });

  const seen = new Set();
  return hints.filter((hint) => {
    const key = `${hint.color}:${hint.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function extractDocxInlineLinkHints(arrayBuffer) {
  if (typeof JSZip === "undefined") return [];

  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) return [];

  const [xmlText, relsText] = await Promise.all([
    documentFile.async("string"),
    zip.file("word/_rels/document.xml.rels")?.async("string") || Promise.resolve(""),
  ]);
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const rels = relationshipTargetMap(relsText);
  const hints = [];

  [...xml.getElementsByTagName("*")]
    .filter((node) => node.localName === "hyperlink")
    .forEach((node) => {
      const id = xmlAttribute(node, "id");
      pushInlineLinkHint(hints, xmlChildrenByLocalName(node, "t").map((item) => item.textContent || "").join(""), rels[id]);
    });

  [...xml.getElementsByTagName("*")]
    .filter((node) => node.localName === "p")
    .forEach((paragraph) => {
      let href = "";
      let text = "";
      let collecting = false;

      xmlChildrenByLocalName(paragraph, "r").forEach((run) => {
        const fldChar = xmlChildrenByLocalName(run, "fldChar")[0];
        const fldType = xmlAttribute(fldChar, "fldCharType");

        if (fldType === "begin") {
          href = "";
          text = "";
          collecting = false;
          return;
        }

        const instr = xmlChildrenByLocalName(run, "instrText").map((item) => item.textContent || "").join("");
        const match = instr.match(/HYPERLINK\s+"([^"]+)"/i);
        if (match) {
          href = match[1];
          return;
        }

        if (fldType === "separate") {
          collecting = Boolean(href);
          return;
        }

        if (fldType === "end") {
          pushInlineLinkHint(hints, text, href);
          href = "";
          text = "";
          collecting = false;
          return;
        }

        if (collecting) text += runText(run);
      });
    });

  const seen = new Set();
  return hints.filter((hint) => {
    const key = `${hint.href}:${hint.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function looseTextKey(value) {
  return stripTags(value).toLowerCase().replace(/&nbsp;/g, " ").replace(/[\s'’`.,:;!?()[\]{}"«»<>|\\/-]+/g, "");
}

function matchingHighlightHint(line, hints) {
  const lineKey = looseTextKey(line);
  return hints
    .filter((hint) => hint.color === "green" || hint.color === "white")
    .filter((hint) => looseTextKey(hint.text).length >= 3)
    .sort((a, b) => looseTextKey(b.text).length - looseTextKey(a.text).length)
    .find((hint) => lineKey.includes(looseTextKey(hint.text)));
}

function isUrlOnlyLine(line) {
  return /^(?:https?:\/\/|\/)\S+$/i.test(stripTags(line).replace(/&amp;/g, "&"));
}

function buttonMarkerForColor(color) {
  return color === "white" ? "Button white" : "Button green";
}

function buttonLabelFromHighlightedLine(line) {
  return stripTags(line).replace(/^(?:кнопка|button)\s*:?\s*/iu, "").trim();
}

function applyDocxHighlightButtonHints(text, hints = []) {
  if (!hints.length) return text;

  const lines = String(text || "").split("\n");
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isButtonLine(line)) {
      output.push(line);
      continue;
    }

    const hint = matchingHighlightHint(line, hints);
    if (!hint) {
      output.push(line);
      continue;
    }

    if (/\(((?:https?:\/\/|\/)[^)]+)\)/i.test(line)) {
      const label = line.replace(/^(?:кнопка|button)\s*:?\s*/iu, "");
      output.push(`${buttonMarkerForColor(hint.color)}: ${label}`);
      continue;
    }

    if (/^(?:\s*<[^>]+>)*\s*(?:кнопка|button)/iu.test(line) && isUrlOnlyLine(lines[index + 1] || "")) {
      const label = buttonLabelFromHighlightedLine(line);
      output.push(`${buttonMarkerForColor(hint.color)}: ${label}`);
      continue;
    }

    output.push(line);
  }

  return output.join("\n");
}

function inlineLinkPattern(label) {
  const parts = String(label || "").trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!parts.length) return null;
  return new RegExp(parts.join("[\\s\\u00a0]+"), "gu");
}

function applyDocxInlineLinkHints(text, hints = []) {
  if (!hints.length) return text;

  return String(text || "").split("\n").map((line) => {
    const chunks = line.split(/(<a href="[^"]+"(?: target="_blank")?>[\s\S]*?<\/a>)/g);

    return chunks.map((chunk) => {
      if (/^<a href=/.test(chunk)) return chunk;

      return hints
        .slice()
        .sort((a, b) => b.text.length - a.text.length)
        .reduce((value, hint) => {
          const pattern = inlineLinkPattern(hint.text);
          if (!pattern) return value;
          return value.replace(pattern, (match) => inlineLinkHtml(hint.href, match));
        }, chunk);
    }).join("");
  }).join("\n");
}

function normalizeDocxHtml(html, highlightHints = [], inlineLinkHints = []) {
  let text = String(html || "");

  text = text.replace(/&amp;/g, "&");
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => inlineLinkHtml(href, inner));

  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<em>/gi, "<i>")
    .replace(/<\/em>/gi, "</i>")
    .replace(/<h[1-6][^>]*>/gi, "<b>")
    .replace(/<\/h[1-6]>/gi, "</b>\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<(?!\/?(?:b|i|u|a)\b)[^>]+>/gi, "");

  text = text
    .replace(/(?:<b>)?(message\.service(?:\.[a-z]{2,5})?\.\d+\.topic)(?:<\/b>)?/gi, "\n$1\n")
    .replace(/(?:<b>)?(message\.service(?:\.[a-z]{2,5})?\.\d+)(?![\d.])(?:<\/b>)?/gi, "\n$1\n");
  let seenTopicKey = false;
  text = text.replace(/\n(message\.service(?:\.(?!topic\b)[a-z0-9_-]+)+\.topic)\n/gi, (_, topicKeyText) => {
    const prefix = seenTopicKey ? "\n\n" : "\n";
    seenTopicKey = true;
    return `${prefix}${topicKeyText}\n`;
  });

  text = applyDocxInlineLinkHints(text, inlineLinkHints);
  text = applyDocxHighlightButtonHints(text, highlightHints);
  text = separateLanguageHeaders(text);

  return normalizeButtonBlocks(text);
}

function makeButtonHtml(version, buttons) {
  if (!buttons.length) return "";

  const green = buttons.find((button) => button.color === "green");
  const white = buttons.find((button) => button.color === "white");
  const safeText = (value) => applyNbsp(restoreAllowedTags(escapeHtml(value)), false);
  const visibleLength = (value) => stripTagsWithSpaces(value).length;
  const compactSize = (button) => (visibleLength(button.text) > 20 ? "width: 180px; height: 35px;" : "width: 140px; height: 25px;");
  const redesignAccent = version === "pcMb6r" ? "#00B777" : "#01B462";

  const hasDuplicateColors = new Set(buttons.map((button) => button.color)).size !== buttons.length;
  if (buttons.length > 2 || hasDuplicateColors) {
    const anchor = (button, index) => {
      const isWhite = button.color === "white";
      const margin = index ? (version === "compact" ? "\n\n  " : "\n\n  ") : "";

      if (version === "compact") {
        return `${margin}<a href="${button.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(button)} padding: 0 12px;\n            background-color: ${isWhite ? "transparent" : "#07974D"}; color: ${isWhite ? "#07974D" : "#FFFFFF"}; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: ${isWhite ? "1px solid #07974D" : "none"};">\n    ${safeText(button.text)}\n  </a>`;
      }

      if (version === "mobile") {
        return `${margin}<a href="${button.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;${index ? " margin-top: 6px;" : ""}\n            background-color: ${isWhite ? "transparent" : "#07974D"}; color: ${isWhite ? "#07974D" : "#FFFFFF"}; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: ${isWhite ? "1px solid #07974D" : "none"}; transform: rotate(0deg);">\n    ${safeText(button.text)}\n  </a>`;
      }

      return `${margin}<a href="${button.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${isWhite ? "transparent" : redesignAccent}; color: ${isWhite ? redesignAccent : "#FFFFFF"}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: ${isWhite ? `2px solid ${redesignAccent}` : "none"};">\n    ${safeText(button.text)}\n  </a>`;
    };

    if (version === "compact") return `<div style="display: inline-flex; gap: 8px;">\n  ${buttons.map(anchor).join("")}\n</div>`;
    if (version === "mobile") return `<div style="display: flex; flex-direction: column;">\n  ${buttons.map(anchor).join("")}\n</div>`;
    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  ${buttons.map(anchor).join("")}\n\n</div>`;
  }

  if (!green && white) {
    if (version === "compact") {
      return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(white)} padding: 0 12px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D;">\n    ${safeText(white.text)}\n  </a>\n</div>`;
    }

    if (version === "mobile") {
      return `<div style="display: flex; flex-direction: column;">\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D; transform: rotate(0deg);">\n    ${safeText(white.text)}\n  </a>\n</div>`;
    }

    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${white.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: transparent; color: ${redesignAccent}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: 2px solid ${redesignAccent};">\n    ${safeText(white.text)}\n  </a>\n\n</div>`;
  }

  if (!white) {
    if (version === "compact") {
      return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(green)} padding: 0 12px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none;">\n    ${safeText(green.text)}\n  </a>\n</div>`;
    }

    if (version === "mobile") {
      return `<div style="display: flex; flex-direction: column;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none; transform: rotate(0deg);">\n    ${safeText(green.text)}\n  </a>\n</div>`;
    }

    return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${green.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${redesignAccent}; color: #FFFFFF; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n</div>`;
  }

  if (version === "compact") {
    return `<div style="display: inline-flex; gap: 8px;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(green)} padding: 0 12px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            ${compactSize(white)} padding: 0 12px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D;">\n    ${safeText(white.text)}\n  </a>\n</div>`;
  }

  if (version === "mobile") {
    return `<div style="display: flex; flex-direction: column;">\n  <a href="${green.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px;\n            background-color: #07974D; color: #FFFFFF; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: none; transform: rotate(0deg);">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}" target="_blank"\n     style="display: inline-flex; justify-content: center; align-items: center;\n            width: 361px; height: 40px; padding: 9px 24px; margin-top: 6px;\n            background-color: transparent; color: #07974D; text-decoration: none;\n            font-weight: normal; text-align: center;\n            border-radius: 4px; font-family: Arial, sans-serif; font-size: 12px;\n            box-sizing: border-box; opacity: 1; border: 1px solid #07974D; transform: rotate(0deg);">\n    ${safeText(white.text)}\n  </a>\n</div>`;
  }

  return `<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">\n\n  <a href="${green.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: ${redesignAccent}; color: #FFFFFF; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: none;">\n    ${safeText(green.text)}\n  </a>\n\n  <a href="${white.url}"\n     style="display: inline-flex; justify-content: center; align-items: center;\n     width: 100%; max-width: 300px; height: 40px;\n     padding: 0 24px; margin-top: 12px;\n     background-color: transparent; color: ${redesignAccent}; text-decoration: none;\n     font-weight: 600; text-align: center;\n     border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;\n     box-sizing: border-box; border: 2px solid ${redesignAccent};">\n    ${safeText(white.text)}\n  </a>\n\n</div>`;
}

function renderSegments(version, segments) {
  const rendered = [];

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const next = segments[index + 1];
    const previous = segments[index - 1];

    if (segment.type === "break") {
      if (previous?.kind === "list") {
        if (!String(rendered[rendered.length - 1] || "").match(/<br>\s*$/)) rendered.push("\n<br>\n");
        continue;
      }
      if ((version === "pc" || version === "pcMb6r") && next?.type === "button") continue;
      if (!String(rendered[rendered.length - 1] || "").includes("<br><br>")) rendered.push("\n\n<br><br>\n\n");
      continue;
    }

    const html = segment.type === "button" ? makeButtonHtml(version, segment.buttons) : segment.html;
    if (!html) continue;

    if ((version === "compact" || version === "mobile") && segment.type === "button") {
      const lastRendered = String(rendered[rendered.length - 1] || "");
      if (!lastRendered.includes("<br><br>") && !lastRendered.match(/<br>\s*$/)) rendered.push("\n\n<br><br>\n\n");
      rendered.push(html);
      continue;
    }

    const separator = previous?.type === "line" && segment.type === "line" ? "<br>\n" : "\n\n";
    if (rendered.length && rendered[rendered.length - 1] !== "<br><br>") rendered.push(separator);
    rendered.push(html);
  }

  return rendered.join("").replace(/\n{3,}/g, "\n\n").trim();
}

function renderTopicOutput(topic) {
  const plainTopic = String(topic || "").trim();
  if (!plainTopic) return "";

  const redesignTopic = applyNbsp(escapeHtml(plainTopic));
  if (redesignTopic === escapeHtml(plainTopic)) return plainTopic;

  return `${plainTopic}\n\nredesign\n${redesignTopic}`;
}

function redesignUrlFromOld(url) {
  const raw = String(url || "").replace(/&amp;/g, "&").trim();
  let parsed;

  try {
    parsed = new URL(raw, "https://locform.local");
  } catch {
    return raw;
  }

  const urlWeb = parsed.searchParams.get("url_web");
  if (!urlWeb) return raw;

  const cleanPath = urlWeb.trim();
  if (!cleanPath || /^lps\//i.test(cleanPath.replace(/^\/+/, ""))) return raw;

  const relativePath = `/${cleanPath
    .replace(/^\/+/, "")
    .replace(/^(?:en|su|ru|rus|uzb|uz|ar|arg|latam|lat|es|spa|esp)\//i, "")}`;

  const params = new URLSearchParams(parsed.search);
  params.delete("url_web");
  const query = params.toString().replace(/\+/g, "%20");

  return query ? `${relativePath}?${query}` : relativePath;
}

function normalizeRedesignSegments(segments) {
  return segments.map((segment) => {
    if (segment.type !== "button") return segment;
    return {
      ...segment,
      buttons: segment.buttons.map((button) => ({
        ...button,
        url: redesignUrlFromOld(button.url),
      })),
    };
  });
}

function renderKeyTabs() {
  if (!parsedNotifications.length) {
    keyTabs.innerHTML = '<span class="key-empty">Ключи появятся после преобразования</span>';
    copyKeyBtn.disabled = true;
    copyTopicKeyBtn.disabled = true;
    return;
  }

  keyTabs.innerHTML = parsedNotifications.map((section, index) => (
    `<button class="key-tab${index === activeNotificationIndex ? " active" : ""}" type="button" data-key-index="${index}" title="${escapeHtml(section.key)}">${escapeHtml(keyLabel(section))}</button>`
  )).join("");
  copyKeyBtn.disabled = false;
  copyTopicKeyBtn.disabled = false;
}

function renderCurrentNotification() {
  const section = parsedNotifications[activeNotificationIndex];

  if (!section) {
    Object.values(outputs).forEach((output) => { output.value = ""; });
    copyKeyBtn.disabled = true;
    copyTopicKeyBtn.disabled = true;
    updatePreview();
    return;
  }

  outputs.topic.value = renderTopicOutput(section.topic);

  const oldSegments = extractSegments(bodyForSite(section.body, "old"));
  const redesignSegments = extractSegments(bodyForSite(section.body, "redesign"));
  const redesignRenderSegments = redesignSegments.some((segment) => segment.type === "button")
    ? normalizeRedesignSegments(redesignSegments)
    : normalizeRedesignSegments(oldSegments);

  outputs.compact.value = renderSegments("compact", oldSegments);
  outputs.mobile.value = renderSegments("mobile", oldSegments);
  outputs.pc.value = renderSegments("pc", redesignRenderSegments);
  outputs.pcMb6r.value = renderSegments("pcMb6r", redesignRenderSegments);

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

    const arrayBuffer = await file.arrayBuffer();
    const [highlightHints, inlineLinkHints, result] = await Promise.all([
      extractDocxHighlightHints(arrayBuffer.slice(0)).catch(() => []),
      extractDocxInlineLinkHints(arrayBuffer.slice(0)).catch(() => []),
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) }),
    ]);
    setSourceText(normalizeDocxHtml(result.value, highlightHints, inlineLinkHints));
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

function activeNotification() {
  return parsedNotifications[activeNotificationIndex] || null;
}

function topicKeyFor(section) {
  return `${serviceKeyBase(section.key)}.topic`;
}

async function copyTextWithFeedback(button, text) {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  const oldText = button.textContent;
  button.textContent = "Скопировано";
  setTimeout(() => {
    button.textContent = oldText;
  }, 1200);
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const version = button.dataset.copy;
    await copyTextWithFeedback(button, outputs[version].value);
  });
});

copyKeyBtn.addEventListener("click", async () => {
  const section = activeNotification();
  await copyTextWithFeedback(copyKeyBtn, section?.key || "");
});

copyTopicKeyBtn.addEventListener("click", async () => {
  const section = activeNotification();
  await copyTextWithFeedback(copyTopicKeyBtn, section ? topicKeyFor(section) : "");
});

function openGuide() {
  guideModal.hidden = false;
}

function closeGuide() {
  guideModal.hidden = true;
}

function unlockApp() {
  sessionStorage.setItem(accessSessionKey, "1");
  document.body.classList.remove("auth-locked");
  authGate.hidden = true;
  appShell.hidden = false;
}

function lockApp() {
  document.body.classList.add("auth-locked");
  authGate.hidden = false;
  appShell.hidden = true;
  authError.hidden = true;
  authPassword.value = "";
  setTimeout(() => authPassword.focus(), 0);
}

function initializeAccess() {
  if (sessionStorage.getItem(accessSessionKey) === "1") {
    unlockApp();
    return;
  }

  lockApp();
}

guideBtn.addEventListener("click", openGuide);
guideCloseBtn.addEventListener("click", closeGuide);
guideModal.addEventListener("click", (event) => {
  if (event.target === guideModal) closeGuide();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !guideModal.hidden) closeGuide();
});
authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (authPassword.value === accessPassword) {
    unlockApp();
    return;
  }

  authError.hidden = false;
  authPassword.select();
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

sourceText.value = "Вот сюда добавьте какой-то текст, вы же не просто так сюда пришли";
convert();
initializeAccess();
