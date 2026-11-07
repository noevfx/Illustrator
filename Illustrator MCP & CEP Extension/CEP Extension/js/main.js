// Version: 1.0.0
// IL MCP Bridge — main.js (CEP Panel Chromium/Node process)
// Monitora task.json e despacha para ExtendScript sob demanda via window.__adobe_cep__.evalScript

(function () {
  'use strict';

  var fs   = require('fs');
  var path = require('path');
  var os   = require('os');

  // ─── Diretórios da ponte monitorados ─────────────────────────────────────────
  var TEMP_BRIDGE_DIR = path.join(os.tmpdir(), 'il_bridge');
  var DEV_BRIDGE_DIR  = 'D:\\Noe VFX\\.Labs\\Illustrator\\Illustrator MCP & CEP Extension\\MCP Server\\.il_bridge';
  var REL_BRIDGE_DIR  = path.join(__dirname, '..', '..', 'MCP Server', '.il_bridge');

  var BRIDGE_DIRS = [TEMP_BRIDGE_DIR, DEV_BRIDGE_DIR, REL_BRIDGE_DIR];

  var POLL_INTERVAL_MS = 150;
  var TASK_TIMEOUT_MS  = 7000; // Deve ficar abaixo do timeout do servidor Node (8000ms)

  // ─── UI Elements ─────────────────────────────────────────────────────────────
  var statusDot  = document.getElementById('status-dot');
  var statusText = document.getElementById('status-text');
  var logEl      = document.getElementById('log');
  var btnClear   = document.getElementById('btn-clear');

  function setStatus(cls, msg) {
    if (statusDot) statusDot.className = cls || '';
    if (statusText) statusText.textContent = msg;
  }

  function log(msg, cls) {
    if (!logEl) return;
    var line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    logEl.insertBefore(line, logEl.firstChild);
    while (logEl.childNodes.length > 50) {
      logEl.removeChild(logEl.lastChild);
    }
  }

  if (btnClear) {
    btnClear.addEventListener('click', function () {
      if (logEl) logEl.innerHTML = '';
    });
  }

  // ─── Inicialização dos diretórios ────────────────────────────────────────────
  BRIDGE_DIRS.forEach(function (dir) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
      // Ignora erro de permissão ou existência prévia
    }
  });

  var busy = false;
  var handledTasks = {};

  function writeResult(id, payload) {
    var json = typeof payload === 'string' ? payload : JSON.stringify(payload);
    BRIDGE_DIRS.forEach(function (dir) {
      try {
        if (fs.existsSync(dir)) {
          var resFile = path.join(dir, 'result_' + id + '.json');
          fs.writeFileSync(resFile, json, 'utf8');
        }
      } catch (e) {
        // Best-effort
      }
    });
  }

  function findPendingTask() {
    for (var i = 0; i < BRIDGE_DIRS.length; i++) {
      var dir = BRIDGE_DIRS[i];
      var taskPath = path.join(dir, 'task.json');
      try {
        if (fs.existsSync(taskPath)) {
          var raw = fs.readFileSync(taskPath, 'utf8');
          if (raw && raw.trim().length > 0) {
            var data = JSON.parse(raw);
            return { dir: dir, path: taskPath, data: data };
          }
        }
      } catch (e) {
        // Leitura no meio da gravação - tenta no próximo ciclo
      }
    }
    return null;
  }

  function processTask(found) {
    var id   = found.data.id;
    var code = found.data.code;

    // Consome imediatamente o task.json
    try { fs.unlinkSync(found.path); } catch (e) { }

    busy = true;
    handledTasks[id] = false;
    setStatus('running', 'Executando tarefa ' + id + '...');
    log('Tarefa recebida: ' + id, 'warn');

    var timeoutHandle = setTimeout(function () {
      if (handledTasks[id]) return;
      handledTasks[id] = true;
      busy = false;
      setStatus('', 'Aguardando tarefas...');
      log('Timeout (' + TASK_TIMEOUT_MS + 'ms) — diálogo modal pode estar aberto no Illustrator.', 'err');
      writeResult(id, {
        success: false,
        data: null,
        error: 'Timeout no CEP: o Illustrator pode estar ocupado ou com diálogo modal aberto.'
      });
    }, TASK_TIMEOUT_MS);

    try {
      var scriptCall = 'ilmcp_runTask(' + JSON.stringify(code) + ')';

      if (window.__adobe_cep__ && window.__adobe_cep__.evalScript) {
        window.__adobe_cep__.evalScript(scriptCall, function (resultStr) {
          if (handledTasks[id]) return;
          handledTasks[id] = true;
          clearTimeout(timeoutHandle);
          busy = false;

          var parsed;
          try {
            parsed = JSON.parse(resultStr);
          } catch (pe) {
            parsed = { success: false, data: null, error: 'Falha ao interpretar resposta: ' + String(resultStr) };
          }

          writeResult(id, parsed);

          if (parsed && parsed.success) {
            setStatus('running', 'Tarefa ' + id + ' concluída');
            log('Tarefa ' + id + ' OK', 'ok');
          } else {
            setStatus('error', 'Falha na tarefa ' + id);
            log('Tarefa ' + id + ' erro: ' + (parsed ? parsed.error : 'desconhecido'), 'err');
          }

          setTimeout(function () {
            if (!busy) setStatus('', 'Aguardando tarefas...');
          }, 1200);
        });
      } else {
        throw new Error('window.__adobe_cep__.evalScript não disponível neste contexto.');
      }
    } catch (err) {
      if (!handledTasks[id]) {
        handledTasks[id] = true;
        clearTimeout(timeoutHandle);
        busy = false;
        writeResult(id, { success: false, data: null, error: err.toString() });
        setStatus('error', 'Erro ao despachar tarefa');
        log('Erro: ' + err.toString(), 'err');
      }
    }
  }

  function tick() {
    if (busy) return;
    var found = findPendingTask();
    if (found) {
      processTask(found);
    }
  }

  setStatus('', 'Aguardando tarefas...');
  log('IL MCP Bridge iniciado com sucesso', 'ok');

  setInterval(tick, POLL_INTERVAL_MS);
})();
