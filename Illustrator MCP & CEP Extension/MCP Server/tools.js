// Version: 1.0.0
// IL MCP Bridge â€” tools.js
// Gera cÃ³digo ExtendScript (ES3) para cada ferramenta disponÃ­vel.
// Todas as funÃ§Ãµes retornam string de cÃ³digo que serÃ¡ executada no Illustrator via host.jsx.

'use strict';

// â”€â”€â”€ Helpers internos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Escapa string para uso seguro dentro de ExtendScript */
function esc(s) {
  if (s === null || s === undefined) return 'null';
  return JSON.stringify(String(s));
}

/** Retorna cÃ³digo ExtendScript para cor RGB via hex */
function colorCode(hex) {
  if (!hex || hex === 'none' || hex === 'None') {
    return 'null';
  }
  return '(function(){ var c = new RGBColor(); var h="' + hex.replace('#','') +
    '"; c.red=parseInt(h.substring(0,2),16); c.green=parseInt(h.substring(2,4),16); c.blue=parseInt(h.substring(4,6),16); return c; })()';
}

// â”€â”€â”€ 1. il_get_document_info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_document_info() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var abs = [];',
    'var i;',
    'for (i = 0; i < doc.artboards.length; i++) {',
    '  var ab = doc.artboards[i];',
    '  var r = ab.artboardRect;',
    '  abs.push({ name: ab.name, x: r[0], y: r[1], width: r[2]-r[0], height: r[1]-r[3] });',
    '}',
    'var lys = [];',
    'for (i = 0; i < doc.layers.length; i++) {',
    '  lys.push({ name: doc.layers[i].name, visible: doc.layers[i].visible, locked: doc.layers[i].locked });',
    '}',
    'return ilmcp_toJSON({',
    '  name: doc.name,',
    '  path: doc.fullName ? doc.fullName.fsName : "",',
    '  width: doc.width,',
    '  height: doc.height,',
    '  colorSpace: String(doc.documentColorSpace),',
    '  numArtboards: doc.artboards.length,',
    '  numLayers: doc.layers.length,',
    '  numPageItems: doc.pageItems.length,',
    '  artboards: abs,',
    '  layers: lys',
    '});'
  ].join('\n');
}

// â”€â”€â”€ 2. il_execute_script â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_execute_script(params) {
  var code = params.code || '';
  return 'var _r; try { _r = (function(){ ' + code + ' })(); } catch(e){ _r = "ERRO: "+e.message; } return ilmcp_toJSON({ result: _r === undefined ? null : String(_r) });';
}

// â”€â”€â”€ 3. il_get_layers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_layers() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var result = [];',
    'var i;',
    'for (i = 0; i < doc.layers.length; i++) {',
    '  var l = doc.layers[i];',
    '  result.push({ name: l.name, visible: l.visible, locked: l.locked, numItems: l.pageItems.length });',
    '}',
    'return ilmcp_toJSON(result);'
  ].join('\n');
}

// â”€â”€â”€ 4. il_create_layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_create_layer(params) {
  var name = esc(params.name || 'Nova Camada');
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var l = doc.layers.add();',
    'l.name = ' + name + ';',
    'return ilmcp_toJSON({ created: l.name });'
  ].join('\n');
}

// â”€â”€â”€ 5. il_delete_layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_delete_layer(params) {
  var name = esc(params.name);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var l = ilmcp_findLayerByName(doc, ' + name + ');',
    'l.remove();',
    'return ilmcp_toJSON({ deleted: ' + name + ' });'
  ].join('\n');
}

// â”€â”€â”€ 6. il_set_layer_visibility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_set_layer_visibility(params) {
  var name = esc(params.name);
  var visible = params.visible ? 'true' : 'false';
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var l = ilmcp_findLayerByName(doc, ' + name + ');',
    'l.visible = ' + visible + ';',
    'return ilmcp_toJSON({ name: ' + name + ', visible: ' + visible + ' });'
  ].join('\n');
}

// â”€â”€â”€ 7. il_lock_layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_lock_layer(params) {
  var name = esc(params.name);
  var locked = params.locked ? 'true' : 'false';
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var l = ilmcp_findLayerByName(doc, ' + name + ');',
    'l.locked = ' + locked + ';',
    'return ilmcp_toJSON({ name: ' + name + ', locked: ' + locked + ' });'
  ].join('\n');
}

// â”€â”€â”€ 8. il_move_layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_move_layer(params) {
  var name = esc(params.name);
  var index = parseInt(params.index) || 0;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var l = ilmcp_findLayerByName(doc, ' + name + ');',
    'var target = doc.layers[' + index + '];',
    'if (!target) throw new Error("Ãndice de camada invÃ¡lido: ' + index + '");',
    'l.move(target, ElementPlacement.PLACEBEFORE);',
    'return ilmcp_toJSON({ moved: ' + name + ', toIndex: ' + index + ' });'
  ].join('\n');
}

// â”€â”€â”€ 9. il_get_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_selection() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'var result = [];',
    'var i;',
    'if (sel && sel.length) {',
    '  for (i = 0; i < sel.length; i++) {',
    '    var item = sel[i];',
    '    var info = {',
    '      name: item.name,',
    '      type: item.typename,',
    '      left: item.left,',
    '      top: item.top,',
    '      width: item.width,',
    '      height: item.height,',
    '      opacity: item.opacity',
    '    };',
    '    result.push(info);',
    '  }',
    '}',
    'return ilmcp_toJSON({ count: result.length, items: result });'
  ].join('\n');
}

// â”€â”€â”€ 10. il_select_all â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_select_all() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'app.executeMenuCommand("selectall");',
    'return ilmcp_toJSON({ selected: doc.selection.length });'
  ].join('\n');
}

// â”€â”€â”€ 11. il_deselect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_deselect() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'doc.selection = null;',
    'return ilmcp_toJSON({ deselected: true });'
  ].join('\n');
}

// â”€â”€â”€ 12. il_select_by_name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_select_by_name(params) {
  var name = esc(params.name);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var found = null;',
    'var i;',
    'for (i = 0; i < doc.pageItems.length; i++) {',
    '  if (doc.pageItems[i].name === ' + name + ') { found = doc.pageItems[i]; break; }',
    '}',
    'if (!found) throw new Error("Item nao encontrado: " + ' + name + ');',
    'doc.selection = [found];',
    'return ilmcp_toJSON({ selected: found.name, type: found.typename });'
  ].join('\n');
}

// â”€â”€â”€ 13. il_create_rectangle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_create_rectangle(params) {
  var x = parseFloat(params.x) || 0;
  var y = parseFloat(params.y) || 0;
  var w = parseFloat(params.width) || 100;
  var h = parseFloat(params.height) || 100;
  var fill   = colorCode(params.fillColor);
  var stroke = colorCode(params.strokeColor);
  var name   = esc(params.name || '');
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var rect = doc.pathItems.rectangle(' + y + ', ' + x + ', ' + w + ', ' + h + ');',
    'if (' + name + ') rect.name = ' + name + ';',
    'var fc = ' + fill + ';',
    'if (fc) { rect.filled = true; rect.fillColor = fc; } else { rect.filled = false; }',
    'var sc = ' + stroke + ';',
    'if (sc) { rect.stroked = true; rect.strokeColor = sc; } else { rect.stroked = false; }',
    'return ilmcp_toJSON({ name: rect.name, left: rect.left, top: rect.top, width: rect.width, height: rect.height });'
  ].join('\n');
}

// â”€â”€â”€ 14. il_create_ellipse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_create_ellipse(params) {
  var cx    = parseFloat(params.cx) || 0;
  var cy    = parseFloat(params.cy) || 0;
  var rx    = parseFloat(params.rx) || 50;
  var ry    = parseFloat(params.ry) || 50;
  var x     = cx - rx;
  var y     = cy + ry;
  var fill   = colorCode(params.fillColor);
  var stroke = colorCode(params.strokeColor);
  var name   = esc(params.name || '');
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var el = doc.pathItems.ellipse(' + y + ', ' + x + ', ' + (rx*2) + ', ' + (ry*2) + ');',
    'if (' + name + ') el.name = ' + name + ';',
    'var fc = ' + fill + ';',
    'if (fc) { el.filled = true; el.fillColor = fc; } else { el.filled = false; }',
    'var sc = ' + stroke + ';',
    'if (sc) { el.stroked = true; el.strokeColor = sc; } else { el.stroked = false; }',
    'return ilmcp_toJSON({ name: el.name, cx: ' + cx + ', cy: ' + cy + ', rx: ' + rx + ', ry: ' + ry + ' });'
  ].join('\n');
}

// â”€â”€â”€ 15. il_create_path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_create_path(params) {
  var points     = params.points || [];
  var fill       = colorCode(params.fillColor);
  var stroke     = colorCode(params.strokeColor);
  var closed     = params.closed !== false ? 'true' : 'false';
  var name       = esc(params.name || '');
  var pointsCode = JSON.stringify(points);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var p = doc.pathItems.add();',
    'if (' + name + ') p.name = ' + name + ';',
    'var pts = ' + pointsCode + ';',
    'var i;',
    'for (i = 0; i < pts.length; i++) {',
    '  var pp = p.pathPoints.add();',
    '  pp.anchor = [pts[i][0], pts[i][1]];',
    '  pp.leftDirection  = [pts[i][0], pts[i][1]];',
    '  pp.rightDirection = [pts[i][0], pts[i][1]];',
    '  pp.pointType = PointType.CORNER;',
    '}',
    'p.closed = ' + closed + ';',
    'var fc = ' + fill + ';',
    'if (fc) { p.filled = true; p.fillColor = fc; } else { p.filled = false; }',
    'var sc = ' + stroke + ';',
    'if (sc) { p.stroked = true; p.strokeColor = sc; } else { p.stroked = false; }',
    'return ilmcp_toJSON({ name: p.name, numPoints: p.pathPoints.length });'
  ].join('\n');
}

// â”€â”€â”€ 16. il_create_text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_create_text(params) {
  var content  = esc(params.content || 'Texto');
  var x        = parseFloat(params.x) || 0;
  var y        = parseFloat(params.y) || 0;
  var fontSize = parseFloat(params.fontSize) || 24;
  var fontName = esc(params.fontName || '');
  var fill     = colorCode(params.fillColor);
  var name     = esc(params.name || '');
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var tf = doc.textFrames.add();',
    'tf.contents = ' + content + ';',
    'tf.left = ' + x + ';',
    'tf.top  = ' + y + ';',
    'if (' + name + ') tf.name = ' + name + ';',
    'tf.textRange.characterAttributes.size = ' + fontSize + ';',
    'if (' + fontName + ') {',
    '  try { tf.textRange.characterAttributes.textFont = app.textFonts.getByName(' + fontName + '); } catch(e){}',
    '}',
    'var fc = ' + fill + ';',
    'if (fc) tf.textRange.characterAttributes.fillColor = fc;',
    'return ilmcp_toJSON({ name: tf.name, content: tf.contents, left: tf.left, top: tf.top });'
  ].join('\n');
}

// â”€â”€â”€ 17. il_update_text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_update_text(params) {
  var name    = esc(params.name);
  var content = esc(params.content);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var found = null;',
    'var i;',
    'for (i = 0; i < doc.textFrames.length; i++) {',
    '  if (doc.textFrames[i].name === ' + name + ') { found = doc.textFrames[i]; break; }',
    '}',
    'if (!found) throw new Error("TextFrame nao encontrado: " + ' + name + ');',
    'found.contents = ' + content + ';',
    'return ilmcp_toJSON({ name: found.name, content: found.contents });'
  ].join('\n');
}

// â”€â”€â”€ 18. il_set_fill_color â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_set_fill_color(params) {
  var fill = colorCode(params.color);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var fc = ' + fill + ';',
    'var i;',
    'for (i = 0; i < sel.length; i++) {',
    '  if (fc) { sel[i].filled = true; sel[i].fillColor = fc; }',
    '  else     { sel[i].filled = false; }',
    '}',
    'return ilmcp_toJSON({ affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 19. il_set_stroke_color â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_set_stroke_color(params) {
  var stroke = colorCode(params.color);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var sc = ' + stroke + ';',
    'var i;',
    'for (i = 0; i < sel.length; i++) {',
    '  if (sc) { sel[i].stroked = true; sel[i].strokeColor = sc; }',
    '  else     { sel[i].stroked = false; }',
    '}',
    'return ilmcp_toJSON({ affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 20. il_set_stroke_width â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_set_stroke_width(params) {
  var width = parseFloat(params.width) || 1;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var i;',
    'for (i = 0; i < sel.length; i++) { sel[i].strokeWidth = ' + width + '; }',
    'return ilmcp_toJSON({ strokeWidth: ' + width + ', affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 21. il_apply_opacity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_apply_opacity(params) {
  var opacity = Math.min(100, Math.max(0, parseFloat(params.opacity) || 100));
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var i;',
    'for (i = 0; i < sel.length; i++) { sel[i].opacity = ' + opacity + '; }',
    'return ilmcp_toJSON({ opacity: ' + opacity + ', affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 22. il_group_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_group_selection(params) {
  var name = esc(params.name || '');
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var grp = doc.groupItems.add();',
    'if (' + name + ') grp.name = ' + name + ';',
    'var i;',
    'for (i = sel.length - 1; i >= 0; i--) { sel[i].moveToEnd(grp); }',
    'doc.selection = [grp];',
    'return ilmcp_toJSON({ groupName: grp.name, numItems: grp.pageItems.length });'
  ].join('\n');
}

// â”€â”€â”€ 23. il_ungroup_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_ungroup_selection() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'app.executeMenuCommand("ungroup");',
    'return ilmcp_toJSON({ ungrouped: true });'
  ].join('\n');
}

// â”€â”€â”€ 24. il_move_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_move_selection(params) {
  var dx = parseFloat(params.dx) || 0;
  var dy = parseFloat(params.dy) || 0;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var i;',
    'for (i = 0; i < sel.length; i++) {',
    '  sel[i].left += ' + dx + ';',
    '  sel[i].top  += ' + dy + ';',
    '}',
    'return ilmcp_toJSON({ dx: ' + dx + ', dy: ' + dy + ', affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 25. il_resize_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_resize_selection(params) {
  var scaleX  = parseFloat(params.scaleX) || 100;
  var scaleY  = parseFloat(params.scaleY) || 100;
  var uniform = params.uniform !== false ? 'true' : 'false';
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var i;',
    'for (i = 0; i < sel.length; i++) {',
    '  sel[i].resize(' + scaleX + ', ' + scaleY + ', true, true, true, true, ' + scaleX + ', Transformation.CENTER);',
    '}',
    'return ilmcp_toJSON({ scaleX: ' + scaleX + ', scaleY: ' + scaleY + ', affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 26. il_rotate_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_rotate_selection(params) {
  var angle = parseFloat(params.angle) || 0;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var i;',
    'for (i = 0; i < sel.length; i++) { sel[i].rotate(' + angle + '); }',
    'return ilmcp_toJSON({ angle: ' + angle + ', affected: sel.length });'
  ].join('\n');
}

// â”€â”€â”€ 27. il_align_objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_align_objects(params) {
  var alignTo = esc(params.alignTo || 'left');
  var commands = {
    left:   '"alignleft"',
    center: '"aligncenter"',
    right:  '"alignright"',
    top:    '"aligntop"',
    middle: '"alignmiddle"',
    bottom: '"alignbottom"'
  };
  var cmd = commands[params.alignTo] || '"alignleft"';
  return [
    'var doc = ilmcp_getActiveDoc();',
    'app.executeMenuCommand(' + cmd + ');',
    'return ilmcp_toJSON({ aligned: ' + alignTo + ' });'
  ].join('\n');
}

// â”€â”€â”€ 28. il_distribute_objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_distribute_objects(params) {
  var dir = params.direction || 'horizontal';
  var cmd = dir === 'vertical' ? '"VDistributeCenter"' : '"HDistributeCenter"';
  return [
    'app.executeMenuCommand(' + cmd + ');',
    'return ilmcp_toJSON({ distributed: ' + esc(dir) + ' });'
  ].join('\n');
}

// â”€â”€â”€ 29. il_get_artboards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_artboards() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var result = [];',
    'var i;',
    'for (i = 0; i < doc.artboards.length; i++) {',
    '  var ab = doc.artboards[i];',
    '  var r = ab.artboardRect;',
    '  result.push({ index: i, name: ab.name, x: r[0], y: r[1], width: r[2]-r[0], height: r[1]-r[3] });',
    '}',
    'return ilmcp_toJSON(result);'
  ].join('\n');
}

// â”€â”€â”€ 30. il_add_artboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_add_artboard(params) {
  var name = esc(params.name || 'Artboard');
  var x    = parseFloat(params.x) || 0;
  var y    = parseFloat(params.y) || 0;
  var w    = parseFloat(params.width) || 800;
  var h    = parseFloat(params.height) || 600;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var idx = doc.artboards.add([' + x + ', ' + (y+h) + ', ' + (x+w) + ', ' + y + ']);',
    'doc.artboards[idx].name = ' + name + ';',
    'return ilmcp_toJSON({ name: ' + name + ', index: idx });'
  ].join('\n');
}

// â”€â”€â”€ 31. il_set_active_artboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_set_active_artboard(params) {
  if (params.index !== undefined) {
    var idx = parseInt(params.index);
    return [
      'var doc = ilmcp_getActiveDoc();',
      'doc.artboards.setActiveArtboardIndex(' + idx + ');',
      'return ilmcp_toJSON({ activeIndex: ' + idx + ' });'
    ].join('\n');
  }
  var name = esc(params.name);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var found = -1;',
    'var i;',
    'for (i = 0; i < doc.artboards.length; i++) {',
    '  if (doc.artboards[i].name === ' + name + ') { found = i; break; }',
    '}',
    'if (found < 0) throw new Error("Artboard nao encontrado: " + ' + name + ');',
    'doc.artboards.setActiveArtboardIndex(found);',
    'return ilmcp_toJSON({ activeIndex: found, name: ' + name + ' });'
  ].join('\n');
}

// â”€â”€â”€ 32. il_export_svg â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_export_svg(params) {
  var outputPath = esc(params.outputPath);
  var artboardIndex = params.artboardIndex !== undefined ? parseInt(params.artboardIndex) : -1;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var exportFile = new File(' + outputPath + ');',
    'var opts = new ExportOptionsSVG();',
    'opts.embedRasterImages = false;',
    'opts.preserveEditability = true;',
    'opts.embedAllFonts = false;',
    artboardIndex >= 0 ? 'doc.artboards.setActiveArtboardIndex(' + artboardIndex + ');' : '',
    'doc.exportFile(exportFile, ExportType.SVG, opts);',
    'return ilmcp_toJSON({ exported: ' + outputPath + ' });'
  ].join('\n');
}

// â”€â”€â”€ 33. il_export_png â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_export_png(params) {
  var outputPath  = esc(params.outputPath);
  var resolution  = parseFloat(params.resolution) || 150;
  var artboardIdx = params.artboardIndex !== undefined ? parseInt(params.artboardIndex) : -1;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var exportFile = new File(' + outputPath + ');',
    'var opts = new ExportOptionsPNG24();',
    'opts.resolution = ' + resolution + ';',
    'opts.transparency = true;',
    'opts.antiAliasing = true;',
    artboardIdx >= 0 ? 'doc.artboards.setActiveArtboardIndex(' + artboardIdx + ');' : '',
    'doc.exportFile(exportFile, ExportType.PNG24, opts);',
    'return ilmcp_toJSON({ exported: ' + outputPath + ', resolution: ' + resolution + ' });'
  ].join('\n');
}

// â”€â”€â”€ 34. il_export_pdf â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_export_pdf(params) {
  var outputPath = esc(params.outputPath);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var saveFile = new File(' + outputPath + ');',
    'var opts = new PDFSaveOptions();',
    'opts.compatibility = PDFCompatibility.ACROBAT5;',
    'opts.generateThumbnails = true;',
    'opts.preserveEditability = true;',
    'doc.saveAs(saveFile, opts);',
    'return ilmcp_toJSON({ exported: ' + outputPath + ' });'
  ].join('\n');
}

// â”€â”€â”€ 35. il_save_document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_save_document() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'doc.save();',
    'return ilmcp_toJSON({ saved: doc.name });'
  ].join('\n');
}

// â”€â”€â”€ 36. il_open_document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_open_document(params) {
  var filePath = esc(params.filePath);
  return [
    'var f = new File(' + filePath + ');',
    'if (!f.exists) throw new Error("Arquivo nao encontrado: " + ' + filePath + ');',
    'var doc = app.open(f);',
    'return ilmcp_toJSON({ opened: doc.name, width: doc.width, height: doc.height });'
  ].join('\n');
}

// â”€â”€â”€ 37. il_close_document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_close_document(params) {
  var saveFirst = params.saveFirst ? 'SaveOptions.SAVECHANGES' : 'SaveOptions.DONOTSAVECHANGES';
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var name = doc.name;',
    'doc.close(' + saveFirst + ');',
    'return ilmcp_toJSON({ closed: name });'
  ].join('\n');
}

// â”€â”€â”€ 38. il_create_document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_create_document(params) {
  var w          = parseFloat(params.width)  || 800;
  var h          = parseFloat(params.height) || 600;
  var colorSpace = params.colorSpace === 'CMYK' ? 'DocumentColorSpace.CMYK' : 'DocumentColorSpace.RGB';
  var name       = esc(params.name || 'Sem TÃ­tulo');
  return [
    'var profile = ' + colorSpace + ' === DocumentColorSpace.CMYK ? DocumentPreset.CMYK : DocumentPreset.RGB;',
    'var preset = new DocumentPreset();',
    'preset.width  = ' + w + ';',
    'preset.height = ' + h + ';',
    'preset.colorMode = ' + colorSpace + ';',
    'var doc = app.documents.addDocument(' + name + ', preset);',
    'return ilmcp_toJSON({ name: doc.name, width: doc.width, height: doc.height });'
  ].join('\n');
}

// â”€â”€â”€ 39. il_get_swatches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_swatches() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var result = [];',
    'var i;',
    'for (i = 0; i < doc.swatches.length; i++) {',
    '  var sw = doc.swatches[i];',
    '  try {',
    '    var c = sw.color;',
    '    result.push({ name: sw.name, type: c.typename });',
    '  } catch(e) {',
    '    result.push({ name: sw.name, type: "unknown" });',
    '  }',
    '}',
    'return ilmcp_toJSON(result);'
  ].join('\n');
}

// â”€â”€â”€ 40. il_add_guide â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_add_guide(params) {
  var orientation = params.orientation === 'vertical' ? 'true' : 'false'; // vertical = true
  var position    = parseFloat(params.position) || 0;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var guide = doc.guides.add(' + (params.orientation === 'vertical' ? 'Orientation.VERTICAL' : 'Orientation.HORIZONTAL') + ', ' + position + ');',
    'return ilmcp_toJSON({ orientation: ' + esc(params.orientation || 'horizontal') + ', position: ' + position + ' });'
  ].join('\n');
}

// â”€â”€â”€ 41. il_clear_guides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_clear_guides() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var i;',
    'for (i = doc.guides.length - 1; i >= 0; i--) { doc.guides[i].remove(); }',
    'return ilmcp_toJSON({ cleared: true });'
  ].join('\n');
}

// â”€â”€â”€ 42. il_get_symbols â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_symbols() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var result = [];',
    'var i;',
    'for (i = 0; i < doc.symbols.length; i++) {',
    '  result.push({ name: doc.symbols[i].name });',
    '}',
    'return ilmcp_toJSON(result);'
  ].join('\n');
}

// â”€â”€â”€ 43. il_place_image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_place_image(params) {
  var filePath = esc(params.filePath);
  var x        = parseFloat(params.x) || 0;
  var y        = parseFloat(params.y) || 0;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var f = new File(' + filePath + ');',
    'if (!f.exists) throw new Error("Arquivo nao encontrado: " + ' + filePath + ');',
    'var placed = doc.placedItems.add();',
    'placed.file = f;',
    'placed.left = ' + x + ';',
    'placed.top  = ' + y + ';',
    'return ilmcp_toJSON({ name: placed.name, left: placed.left, top: placed.top });'
  ].join('\n');
}

// â”€â”€â”€ 44. il_apply_effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_apply_effect(params) {
  var effectName = esc(params.effectName);
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'app.executeMenuCommand(' + effectName + ');',
    'return ilmcp_toJSON({ effect: ' + effectName + ', applied: true });'
  ].join('\n');
}

// â”€â”€â”€ 45. il_get_fonts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_get_fonts(params) {
  var limit = parseInt(params.limit) || 100;
  return [
    'var result = [];',
    'var i;',
    'var total = Math.min(app.textFonts.length, ' + limit + ');',
    'for (i = 0; i < total; i++) {',
    '  result.push({ name: app.textFonts[i].name, family: app.textFonts[i].family });',
    '}',
    'return ilmcp_toJSON({ total: app.textFonts.length, shown: result.length, fonts: result });'
  ].join('\n');
}

// â”€â”€â”€ 46. il_duplicate_selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_duplicate_selection(params) {
  var dx = parseFloat(params.dx) || 10;
  var dy = parseFloat(params.dy) || 10;
  return [
    'var doc = ilmcp_getActiveDoc();',
    'var sel = doc.selection;',
    'if (!sel || !sel.length) throw new Error("Nenhum objeto selecionado.");',
    'var copies = [];',
    'var i;',
    'for (i = 0; i < sel.length; i++) {',
    '  var copy = sel[i].duplicate();',
    '  copy.left += ' + dx + ';',
    '  copy.top  += ' + dy + ';',
    '  copies.push(copy.name);',
    '}',
    'return ilmcp_toJSON({ duplicated: copies.length, names: copies });'
  ].join('\n');
}

// â”€â”€â”€ 47. il_bring_to_front â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_bring_to_front() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'app.executeMenuCommand("sendToFront");',
    'return ilmcp_toJSON({ action: "bringToFront" });'
  ].join('\n');
}

// â”€â”€â”€ 48. il_send_to_back â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_send_to_back() {
  return [
    'var doc = ilmcp_getActiveDoc();',
    'app.executeMenuCommand("sendToBack");',
    'return ilmcp_toJSON({ action: "sendToBack" });'
  ].join('\n');
}

// â”€â”€â”€ 49. il_fit_artboard_to_artwork â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_fit_artboard_to_artwork(params) {
  var idx = params.index !== undefined ? parseInt(params.index) : -1;
  return [
    'var doc = ilmcp_getActiveDoc();',
    idx >= 0 ? 'doc.artboards.setActiveArtboardIndex(' + idx + ');' : '',
    'app.executeMenuCommand("fitArtboard");',
    'return ilmcp_toJSON({ fitted: true });'
  ].join('\n');
}

// â”€â”€â”€ 50. il_zoom_to_fit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function il_zoom_to_fit() {
  return [
    'app.executeMenuCommand("fitall");',
    'return ilmcp_toJSON({ zoomed: true });'
  ].join('\n');
}

// â”€â”€â”€ ExportaÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
module.exports = {
  il_get_document_info:       il_get_document_info,
  il_execute_script:          il_execute_script,
  il_get_layers:              il_get_layers,
  il_create_layer:            il_create_layer,
  il_delete_layer:            il_delete_layer,
  il_set_layer_visibility:    il_set_layer_visibility,
  il_lock_layer:              il_lock_layer,
  il_move_layer:              il_move_layer,
  il_get_selection:           il_get_selection,
  il_select_all:              il_select_all,
  il_deselect:                il_deselect,
  il_select_by_name:          il_select_by_name,
  il_create_rectangle:        il_create_rectangle,
  il_create_ellipse:          il_create_ellipse,
  il_create_path:             il_create_path,
  il_create_text:             il_create_text,
  il_update_text:             il_update_text,
  il_set_fill_color:          il_set_fill_color,
  il_set_stroke_color:        il_set_stroke_color,
  il_set_stroke_width:        il_set_stroke_width,
  il_apply_opacity:           il_apply_opacity,
  il_group_selection:         il_group_selection,
  il_ungroup_selection:       il_ungroup_selection,
  il_move_selection:          il_move_selection,
  il_resize_selection:        il_resize_selection,
  il_rotate_selection:        il_rotate_selection,
  il_align_objects:           il_align_objects,
  il_distribute_objects:      il_distribute_objects,
  il_get_artboards:           il_get_artboards,
  il_add_artboard:            il_add_artboard,
  il_set_active_artboard:     il_set_active_artboard,
  il_export_svg:              il_export_svg,
  il_export_png:              il_export_png,
  il_export_pdf:              il_export_pdf,
  il_save_document:           il_save_document,
  il_open_document:           il_open_document,
  il_close_document:          il_close_document,
  il_create_document:         il_create_document,
  il_get_swatches:            il_get_swatches,
  il_add_guide:               il_add_guide,
  il_clear_guides:            il_clear_guides,
  il_get_symbols:             il_get_symbols,
  il_place_image:             il_place_image,
  il_apply_effect:            il_apply_effect,
  il_get_fonts:               il_get_fonts,
  il_duplicate_selection:     il_duplicate_selection,
  il_bring_to_front:          il_bring_to_front,
  il_send_to_back:            il_send_to_back,
  il_fit_artboard_to_artwork: il_fit_artboard_to_artwork,
  il_zoom_to_fit:             il_zoom_to_fit
};

