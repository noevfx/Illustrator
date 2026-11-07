// Version: 1.0.0
// IL MCP Bridge — il-runner.js
// Módulo de comunicação com a ponte CEP via sistema de arquivos.
// Escreve task.json e aguarda result_<id>.json aparecer.

'use strict';

var os   = require('os');
var path = require('path');
var fs   = require('fs');

// ─── Configurações ────────────────────────────────────────────────────────────
var TASK_TIMEOUT_MS  = 8000;
var POLL_INTERVAL_MS = 150;

var TEMP_BRIDGE_DIR    = path.join(os.tmpdir(), 'il_bridge');
var PACKAGE_BRIDGE_DIR = path.join(__dirname, '.il_bridge');

// ─── Utilitários ──────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(TEMP_BRIDGE_DIR);
ensureDir(PACKAGE_BRIDGE_DIR);

var _taskCounter = 0;

function generateTaskId() {
  _taskCounter++;
  return 'il_' + Date.now() + '_' + _taskCounter;
}

/**
 * Tenta escrever a task em ambas as pastas (temp e package).
 * O panel CEP monitora ambas.
 */
function writeTask(taskId, code) {
  var payload = JSON.stringify({ id: taskId, code: code });
  var dirs = [TEMP_BRIDGE_DIR, PACKAGE_BRIDGE_DIR];
  var written = false;

  dirs.forEach(function (dir) {
    try {
      ensureDir(dir);
      fs.writeFileSync(path.join(dir, 'task.json'), payload, 'utf8');
      written = true;
    } catch (e) {
      // tenta a próxima pasta
    }
  });

  if (!written) {
    throw new Error('Não foi possível escrever task.json em nenhuma pasta da ponte.');
  }
}

/**
 * Aguarda o arquivo result_<taskId>.json aparecer em qualquer pasta monitorada.
 * @returns {Promise<object>} Resultado parseado
 */
function waitForResult(taskId) {
  return new Promise(function (resolve, reject) {
    var dirs = [TEMP_BRIDGE_DIR, PACKAGE_BRIDGE_DIR];
    var elapsed = 0;
    var interval;

    interval = setInterval(function () {
      elapsed += POLL_INTERVAL_MS;

      var found = false;
      dirs.forEach(function (dir) {
        if (found) return;
        var resultFile = path.join(dir, 'result_' + taskId + '.json');
        if (fs.existsSync(resultFile)) {
          found = true;
          clearInterval(interval);
          try {
            var raw = fs.readFileSync(resultFile, 'utf8');
            fs.unlinkSync(resultFile);
            var parsed = JSON.parse(raw);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Erro ao ler resultado: ' + e.message));
          }
        }
      });

      if (elapsed >= TASK_TIMEOUT_MS) {
        clearInterval(interval);
        // Limpa arquivos de task pendentes para não re-executar
        dirs.forEach(function (dir) {
          var taskFile = path.join(dir, 'task.json');
          try { if (fs.existsSync(taskFile)) fs.unlinkSync(taskFile); } catch (e) { /* ignora */ }
        });
        reject(new Error(
          'Timeout: Illustrator não respondeu em ' + (TASK_TIMEOUT_MS / 1000) + 's. ' +
          'Verifique se o painel IL MCP Bridge está aberto em Window > Extensions > IL MCP Bridge.'
        ));
      }
    }, POLL_INTERVAL_MS);
  });
}

/**
 * runScript(code)
 * Envia código ExtendScript para o Illustrator via ponte CEP e aguarda resultado.
 *
 * @param {string} code - Código ExtendScript a executar
 * @returns {Promise<{success: boolean, data: any, error: string|null}>}
 */
function runScript(code) {
  var taskId = generateTaskId();

  try {
    writeTask(taskId, code);
  } catch (e) {
    return Promise.reject(new Error('Erro ao criar task: ' + e.message));
  }

  return waitForResult(taskId);
}

module.exports = { runScript: runScript };
