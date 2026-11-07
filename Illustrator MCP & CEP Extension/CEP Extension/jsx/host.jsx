// Version: 1.0.0
// IL MCP Bridge — host.jsx (ExtendScript ES3 para Adobe Illustrator)
// Executado sob demanda via CEP window.__adobe_cep__.evalScript

#target illustrator

/**
 * ilmcp_runTask(code)
 * Executa código ExtendScript no Illustrator e retorna JSON stringificado.
 */
function ilmcp_runTask(code) {
  var evalResult = null;
  var errorMsg = null;

  try {
    evalResult = eval("(function() { " + code + " })()");
  } catch (err) {
    errorMsg = err.toString() + (err.line ? " (Linha " + err.line + ")" : "");
  }

  if (errorMsg !== null) {
    return ilmcp_toJSON({ success: false, data: null, error: errorMsg });
  }

  // Se evalResult for uma string JSON já serializada por ilmcp_toJSON
  if (typeof evalResult === "string" && (evalResult.charAt(0) === "{" || evalResult.charAt(0) === "[")) {
    return '{"success":true,"data":' + evalResult + ',"error":null}';
  }

  return ilmcp_toJSON({ success: true, data: evalResult, error: null });
}

/**
 * ilmcp_toJSON(obj)
 * Serializa objeto para JSON string (ES3 com fallback manual).
 */
function ilmcp_toJSON(obj) {
  try {
    if (typeof JSON !== "undefined" && JSON && JSON.stringify) {
      return JSON.stringify(obj);
    }
  } catch (e) { }

  return ilmcp_serialize(obj);
}

function ilmcp_serialize(val) {
  if (val === null || val === undefined) return "null";

  var t = typeof val;

  if (t === "boolean") return val ? "true" : "false";

  if (t === "number") {
    if (isNaN(val) || !isFinite(val)) return "null";
    return String(val);
  }

  if (t === "string") {
    var s = String(val);
    s = s.replace(/\\/g, "\\\\");
    s = s.replace(/"/g, '\\"');
    s = s.replace(/\n/g, "\\n");
    s = s.replace(/\r/g, "\\r");
    s = s.replace(/\t/g, "\\t");
    return '"' + s + '"';
  }

  if (t === "object") {
    if (val instanceof Array || (val.length !== undefined && typeof val.splice === "function")) {
      var arrParts = [];
      var i;
      for (i = 0; i < val.length; i++) {
        arrParts.push(ilmcp_serialize(val[i]));
      }
      return "[" + arrParts.join(",") + "]";
    }

    var objParts = [];
    var k;
    for (k in val) {
      if (val.hasOwnProperty(k)) {
        objParts.push('"' + k + '":' + ilmcp_serialize(val[k]));
      }
    }
    return "{" + objParts.join(",") + "}";
  }

  return "null";
}

// ─── Helpers globais para as tools ──────────────────────────────────────────

/**
 * ilmcp_getActiveDoc()
 */
function ilmcp_getActiveDoc() {
  if (!app.documents || app.documents.length === 0) {
    throw new Error("Nenhum documento aberto no Illustrator.");
  }
  return app.activeDocument;
}

/**
 * ilmcp_hexToRGB(hex)
 */
function ilmcp_hexToRGB(hex) {
  if (!hex) return null;
  var h = String(hex).replace("#", "");
  if (h.length === 3) {
    h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
  }
  var r = parseInt(h.substring(0, 2), 16);
  var g = parseInt(h.substring(2, 4), 16);
  var b = parseInt(h.substring(4, 6), 16);
  var c = new RGBColor();
  c.red = isNaN(r) ? 0 : r;
  c.green = isNaN(g) ? 0 : g;
  c.blue = isNaN(b) ? 0 : b;
  return c;
}

/**
 * ilmcp_findLayerByName(doc, name)
 */
function ilmcp_findLayerByName(doc, name) {
  var i;
  for (i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name === name) {
      return doc.layers[i];
    }
  }
  throw new Error("Camada não encontrada: " + name);
}
