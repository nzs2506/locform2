const STORAGE_KEY = "image-buttons";
const MAX_ROWS = 5000;
const ALLOWED_ORIGINS = new Set([
  "https://nzs2506.github.io",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:4187",
  "http://localhost:4173",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Locform-Password",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(request, value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeLanguage(value) {
  const compact = String(value || "").toUpperCase().replace(/[\s._-]+/g, "");
  if (!compact || compact === "ALL" || compact === "ANY") return "";
  if (compact === "RU" || compact === "RUS" || compact === "RUSSIA") return "RUS";
  if (compact === "EN" || compact === "ENG") return "ENG";
  if (compact === "UZ" || compact === "UZB") return "UZB";
  if (compact === "AZ" || compact === "AZE") return "AZ";
  if (["ARG", "LAT", "LATAM", "ES", "ESP", "SPA", "ESLATAM"].includes(compact)) return "ES_LATAM";
  return compact;
}

function compactText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanUrl(value) {
  return String(value || "")
    .trim()
    .replace(/^\(+/, "")
    .replace(/\)+$/, "")
    .replace(/\s*&\s*/g, "&")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s+/g, "");
}

function normalizeRow(row) {
  return {
    scope: /^(?:pc|mb6r|mb3b|all)$/i.test(row?.scope || "") ? String(row.scope).toLowerCase() : "all",
    language: normalizeLanguage(row?.language),
    text: compactText(row?.text),
    group: compactText(row?.group),
    green: cleanUrl(row?.green),
    white: cleanUrl(row?.white),
    width: Math.max(1, Number.parseInt(row?.width, 10) || 319),
    height: Math.max(1, Number.parseInt(row?.height, 10) || 40),
  };
}

function rowKey(row) {
  return [
    row.scope || "",
    normalizeLanguage(row.language),
    compactText(row.text).toLowerCase(),
  ].join("|");
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .slice(0, MAX_ROWS)
    .map(normalizeRow)
    .filter((row) => row.text && (row.green || row.white));
}

function mergeRows(...rowSets) {
  const merged = new Map();
  rowSets.flat().forEach((row) => {
    const normalized = normalizeRow(row);
    if (!normalized.text || (!normalized.green && !normalized.white)) return;
    merged.set(rowKey(normalized), normalized);
  });
  return [...merged.values()].sort((a, b) => (
    a.scope.localeCompare(b.scope) ||
    a.language.localeCompare(b.language) ||
    a.text.localeCompare(b.text)
  ));
}

function parseStoredRows(value) {
  if (!value) return [];

  try {
    return normalizeRows(JSON.parse(value));
  } catch {
    return [];
  }
}

async function readRows(env) {
  return parseStoredRows(await env.IMAGE_BUTTONS.get(STORAGE_KEY));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse(request, { ok: true, service: "locform-images" });
    }

    if (url.pathname !== "/image-buttons") {
      return jsonResponse(request, { error: "Not found" }, 404);
    }

    if (!env.IMAGE_BUTTONS) {
      return jsonResponse(request, { error: "KV binding IMAGE_BUTTONS is missing" }, 500);
    }

    if (request.method === "GET") {
      return jsonResponse(request, await readRows(env));
    }

    if (request.method !== "POST") {
      return jsonResponse(request, { error: "Method not allowed" }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(request, { error: "Invalid JSON" }, 400);
    }

    const password = String(payload?.password || request.headers.get("X-Locform-Password") || "");
    if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
      return jsonResponse(request, { error: "Wrong password" }, 401);
    }

    const incomingRows = normalizeRows(payload?.rows);
    if (!incomingRows.length) {
      return jsonResponse(request, { error: "No valid rows to save" }, 400);
    }

    const rows = mergeRows(await readRows(env), incomingRows);
    await env.IMAGE_BUTTONS.put(STORAGE_KEY, JSON.stringify(rows, null, 2));

    return jsonResponse(request, { ok: true, count: rows.length, rows });
  },
};
