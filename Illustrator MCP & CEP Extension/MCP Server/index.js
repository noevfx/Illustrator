// Version: 1.0.0
// IL MCP Bridge — index.js
// Servidor MCP para controle do Adobe Illustrator via CEP Bridge.
// CommonJS, sem TypeScript, sem compilação.

'use strict';

var McpServer   = require('@modelcontextprotocol/sdk/server/mcp.js').McpServer;
var StdioServerTransport = require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
var z           = require('zod');

var runner = require('./il-runner.js');
var tools  = require('./tools.js');

// ─── Instância do servidor ────────────────────────────────────────────────────
var server = new McpServer({
  name: 'il-mcp-server',
  version: '1.0.0'
});

// ─── Helper: registra tool e chama o gerador de código ───────────────────────
function registerTool(name, description, schema, toolFn) {
  server.tool(name, description, schema, function (params) {
    return Promise.resolve().then(function () {
      var code;
      if (toolFn.length === 0) {
        code = toolFn();
      } else {
        code = toolFn(params);
      }
      return runner.runScript(code);
    }).then(function (result) {
      if (!result.success) {
        return { content: [{ type: 'text', text: 'ERRO: ' + (result.error || 'Erro desconhecido') }], isError: true };
      }
      var text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2);
      return { content: [{ type: 'text', text: text }] };
    }).catch(function (err) {
      return { content: [{ type: 'text', text: 'ERRO: ' + err.message }], isError: true };
    });
  });
}

// ─── Registro das 50 tools ────────────────────────────────────────────────────

// 1. il_get_document_info
registerTool('il_get_document_info',
  'Retorna informações detalhadas do documento ativo no Illustrator: nome, dimensões, espaço de cor, artboards e camadas.',
  {}, function () { return tools.il_get_document_info(); });

// 2. il_execute_script
registerTool('il_execute_script',
  'Executa código ExtendScript livre no Adobe Illustrator. Use para operações avançadas não cobertas por outras tools.',
  { code: z.string().describe('Código ExtendScript a ser executado no Illustrator') },
  function (p) { return tools.il_execute_script(p); });

// 3. il_get_layers
registerTool('il_get_layers',
  'Lista todas as camadas do documento ativo: nome, visibilidade, estado de bloqueio e número de itens.',
  {}, function () { return tools.il_get_layers(); });

// 4. il_create_layer
registerTool('il_create_layer',
  'Cria uma nova camada no documento ativo com o nome especificado.',
  { name: z.string().describe('Nome da nova camada') },
  function (p) { return tools.il_create_layer(p); });

// 5. il_delete_layer
registerTool('il_delete_layer',
  'Remove uma camada pelo nome do documento ativo. Atenção: esta operação é irreversível.',
  { name: z.string().describe('Nome da camada a remover') },
  function (p) { return tools.il_delete_layer(p); });

// 6. il_set_layer_visibility
registerTool('il_set_layer_visibility',
  'Mostra ou oculta uma camada pelo nome.',
  {
    name:    z.string().describe('Nome da camada'),
    visible: z.boolean().describe('true para mostrar, false para ocultar')
  },
  function (p) { return tools.il_set_layer_visibility(p); });

// 7. il_lock_layer
registerTool('il_lock_layer',
  'Bloqueia ou desbloqueia uma camada pelo nome.',
  {
    name:   z.string().describe('Nome da camada'),
    locked: z.boolean().describe('true para bloquear, false para desbloquear')
  },
  function (p) { return tools.il_lock_layer(p); });

// 8. il_move_layer
registerTool('il_move_layer',
  'Reordena uma camada para uma posição específica (índice) na pilha de camadas.',
  {
    name:  z.string().describe('Nome da camada a mover'),
    index: z.number().int().describe('Índice destino (0 = topo)')
  },
  function (p) { return tools.il_move_layer(p); });

// 9. il_get_selection
registerTool('il_get_selection',
  'Retorna informações sobre os objetos atualmente selecionados: nome, tipo, posição e dimensões.',
  {}, function () { return tools.il_get_selection(); });

// 10. il_select_all
registerTool('il_select_all',
  'Seleciona todos os objetos do documento ativo.',
  {}, function () { return tools.il_select_all(); });

// 11. il_deselect
registerTool('il_deselect',
  'Remove a seleção de todos os objetos.',
  {}, function () { return tools.il_deselect(); });

// 12. il_select_by_name
registerTool('il_select_by_name',
  'Seleciona um objeto pelo seu nome no documento ativo.',
  { name: z.string().describe('Nome do objeto a selecionar') },
  function (p) { return tools.il_select_by_name(p); });

// 13. il_create_rectangle
registerTool('il_create_rectangle',
  'Cria um retângulo no documento ativo com posição, dimensões e cores definidas.',
  {
    x:           z.number().describe('Posição X (esquerda)'),
    y:           z.number().describe('Posição Y (topo)'),
    width:       z.number().describe('Largura em pontos'),
    height:      z.number().describe('Altura em pontos'),
    fillColor:   z.string().optional().describe('Cor de preenchimento em hex (#RRGGBB). Omitir para sem preenchimento.'),
    strokeColor: z.string().optional().describe('Cor de contorno em hex (#RRGGBB). Omitir para sem contorno.'),
    name:        z.string().optional().describe('Nome do objeto')
  },
  function (p) { return tools.il_create_rectangle(p); });

// 14. il_create_ellipse
registerTool('il_create_ellipse',
  'Cria uma elipse ou círculo no documento ativo.',
  {
    cx:          z.number().describe('Centro X'),
    cy:          z.number().describe('Centro Y'),
    rx:          z.number().describe('Raio horizontal'),
    ry:          z.number().describe('Raio vertical'),
    fillColor:   z.string().optional().describe('Cor de preenchimento em hex (#RRGGBB)'),
    strokeColor: z.string().optional().describe('Cor de contorno em hex (#RRGGBB)'),
    name:        z.string().optional().describe('Nome do objeto')
  },
  function (p) { return tools.il_create_ellipse(p); });

// 15. il_create_path
registerTool('il_create_path',
  'Cria um PathItem com pontos definidos pelo usuário.',
  {
    points:      z.array(z.array(z.number()).length(2)).describe('Array de pontos [[x,y], ...]'),
    closed:      z.boolean().optional().describe('true para caminho fechado'),
    fillColor:   z.string().optional().describe('Cor de preenchimento em hex (#RRGGBB)'),
    strokeColor: z.string().optional().describe('Cor de contorno em hex (#RRGGBB)'),
    name:        z.string().optional().describe('Nome do objeto')
  },
  function (p) { return tools.il_create_path(p); });

// 16. il_create_text
registerTool('il_create_text',
  'Cria um texto (TextFrame) no documento ativo com conteúdo, posição e estilo.',
  {
    content:   z.string().describe('Conteúdo do texto'),
    x:         z.number().describe('Posição X'),
    y:         z.number().describe('Posição Y (topo)'),
    fontSize:  z.number().optional().describe('Tamanho da fonte em pontos (padrão 24)'),
    fontName:  z.string().optional().describe('Nome da fonte (ex: "ArialMT")'),
    fillColor: z.string().optional().describe('Cor em hex (#RRGGBB)'),
    name:      z.string().optional().describe('Nome do TextFrame')
  },
  function (p) { return tools.il_create_text(p); });

// 17. il_update_text
registerTool('il_update_text',
  'Atualiza o conteúdo de um TextFrame existente pelo nome.',
  {
    name:    z.string().describe('Nome do TextFrame'),
    content: z.string().describe('Novo conteúdo do texto')
  },
  function (p) { return tools.il_update_text(p); });

// 18. il_set_fill_color
registerTool('il_set_fill_color',
  'Define a cor de preenchimento dos objetos selecionados.',
  { color: z.string().describe('Cor em hex (#RRGGBB) ou "none" para remover preenchimento') },
  function (p) { return tools.il_set_fill_color(p); });

// 19. il_set_stroke_color
registerTool('il_set_stroke_color',
  'Define a cor de contorno (stroke) dos objetos selecionados.',
  { color: z.string().describe('Cor em hex (#RRGGBB) ou "none" para remover contorno') },
  function (p) { return tools.il_set_stroke_color(p); });

// 20. il_set_stroke_width
registerTool('il_set_stroke_width',
  'Define a espessura do contorno dos objetos selecionados.',
  { width: z.number().describe('Espessura em pontos') },
  function (p) { return tools.il_set_stroke_width(p); });

// 21. il_apply_opacity
registerTool('il_apply_opacity',
  'Define a opacidade dos objetos selecionados (0 = transparente, 100 = opaco).',
  { opacity: z.number().min(0).max(100).describe('Opacidade de 0 a 100') },
  function (p) { return tools.il_apply_opacity(p); });

// 22. il_group_selection
registerTool('il_group_selection',
  'Agrupa todos os objetos selecionados em um único grupo.',
  { name: z.string().optional().describe('Nome do grupo') },
  function (p) { return tools.il_group_selection(p); });

// 23. il_ungroup_selection
registerTool('il_ungroup_selection',
  'Desagrupa o(s) grupo(s) selecionado(s).',
  {}, function () { return tools.il_ungroup_selection(); });

// 24. il_move_selection
registerTool('il_move_selection',
  'Move os objetos selecionados por um delta (deslocamento) em pontos.',
  {
    dx: z.number().describe('Deslocamento horizontal (positivo = direita)'),
    dy: z.number().describe('Deslocamento vertical (positivo = cima no AI)')
  },
  function (p) { return tools.il_move_selection(p); });

// 25. il_resize_selection
registerTool('il_resize_selection',
  'Redimensiona os objetos selecionados por percentual.',
  {
    scaleX: z.number().describe('Escala horizontal em % (100 = sem mudança)'),
    scaleY: z.number().describe('Escala vertical em % (100 = sem mudança)')
  },
  function (p) { return tools.il_resize_selection(p); });

// 26. il_rotate_selection
registerTool('il_rotate_selection',
  'Rotaciona os objetos selecionados pelo ângulo especificado.',
  { angle: z.number().describe('Ângulo de rotação em graus (positivo = sentido anti-horário)') },
  function (p) { return tools.il_rotate_selection(p); });

// 27. il_align_objects
registerTool('il_align_objects',
  'Alinha os objetos selecionados segundo o critério especificado.',
  {
    alignTo: z.enum(['left','center','right','top','middle','bottom'])
      .describe('Alinhamento: left, center, right, top, middle, bottom')
  },
  function (p) { return tools.il_align_objects(p); });

// 28. il_distribute_objects
registerTool('il_distribute_objects',
  'Distribui os objetos selecionados de forma uniforme horizontalmente ou verticalmente.',
  {
    direction: z.enum(['horizontal','vertical']).describe('Direção de distribuição')
  },
  function (p) { return tools.il_distribute_objects(p); });

// 29. il_get_artboards
registerTool('il_get_artboards',
  'Lista todos os artboards do documento ativo com nome, índice e dimensões.',
  {}, function () { return tools.il_get_artboards(); });

// 30. il_add_artboard
registerTool('il_add_artboard',
  'Adiciona um novo artboard ao documento com dimensões e posição definidas.',
  {
    name:   z.string().describe('Nome do artboard'),
    x:      z.number().describe('Posição X'),
    y:      z.number().describe('Posição Y'),
    width:  z.number().describe('Largura em pontos'),
    height: z.number().describe('Altura em pontos')
  },
  function (p) { return tools.il_add_artboard(p); });

// 31. il_set_active_artboard
registerTool('il_set_active_artboard',
  'Ativa um artboard pelo índice ou pelo nome.',
  {
    index: z.number().int().optional().describe('Índice do artboard (0-based)'),
    name:  z.string().optional().describe('Nome do artboard')
  },
  function (p) { return tools.il_set_active_artboard(p); });

// 32. il_export_svg
registerTool('il_export_svg',
  'Exporta o documento ou artboard ativo como arquivo SVG.',
  {
    outputPath:     z.string().describe('Caminho completo do arquivo SVG de saída'),
    artboardIndex:  z.number().int().optional().describe('Índice do artboard a exportar (opcional)')
  },
  function (p) { return tools.il_export_svg(p); });

// 33. il_export_png
registerTool('il_export_png',
  'Exporta o documento ou artboard ativo como PNG com resolução definida.',
  {
    outputPath:    z.string().describe('Caminho completo do arquivo PNG de saída'),
    resolution:    z.number().optional().describe('Resolução em DPI (padrão 150)'),
    artboardIndex: z.number().int().optional().describe('Índice do artboard a exportar (opcional)')
  },
  function (p) { return tools.il_export_png(p); });

// 34. il_export_pdf
registerTool('il_export_pdf',
  'Exporta (salva como) o documento ativo em formato PDF.',
  { outputPath: z.string().describe('Caminho completo do arquivo PDF de saída') },
  function (p) { return tools.il_export_pdf(p); });

// 35. il_save_document
registerTool('il_save_document',
  'Salva o documento ativo no formato nativo (.ai).',
  {}, function () { return tools.il_save_document(); });

// 36. il_open_document
registerTool('il_open_document',
  'Abre um arquivo .ai, .svg ou outro suportado pelo Illustrator.',
  { filePath: z.string().describe('Caminho completo do arquivo a abrir') },
  function (p) { return tools.il_open_document(p); });

// 37. il_close_document
registerTool('il_close_document',
  'Fecha o documento ativo, com opção de salvar antes.',
  { saveFirst: z.boolean().optional().describe('true para salvar antes de fechar') },
  function (p) { return tools.il_close_document(p); });

// 38. il_create_document
registerTool('il_create_document',
  'Cria um novo documento no Illustrator com dimensões e espaço de cor definidos.',
  {
    width:      z.number().describe('Largura em pontos'),
    height:     z.number().describe('Altura em pontos'),
    colorSpace: z.enum(['RGB','CMYK']).optional().describe('Espaço de cor (padrão RGB)'),
    name:       z.string().optional().describe('Nome do documento')
  },
  function (p) { return tools.il_create_document(p); });

// 39. il_get_swatches
registerTool('il_get_swatches',
  'Lista todas as amostras de cores (swatches) do documento ativo.',
  {}, function () { return tools.il_get_swatches(); });

// 40. il_add_guide
registerTool('il_add_guide',
  'Adiciona uma guia horizontal ou vertical na posição especificada.',
  {
    orientation: z.enum(['horizontal','vertical']).describe('Orientação da guia'),
    position:    z.number().describe('Posição em pontos')
  },
  function (p) { return tools.il_add_guide(p); });

// 41. il_clear_guides
registerTool('il_clear_guides',
  'Remove todas as guias do documento ativo.',
  {}, function () { return tools.il_clear_guides(); });

// 42. il_get_symbols
registerTool('il_get_symbols',
  'Lista todos os símbolos definidos no documento ativo.',
  {}, function () { return tools.il_get_symbols(); });

// 43. il_place_image
registerTool('il_place_image',
  'Coloca (place) uma imagem externa no documento ativo na posição especificada.',
  {
    filePath: z.string().describe('Caminho completo da imagem a colocar'),
    x:        z.number().optional().describe('Posição X (padrão 0)'),
    y:        z.number().optional().describe('Posição Y (padrão 0)')
  },
  function (p) { return tools.il_place_image(p); });

// 44. il_apply_effect
registerTool('il_apply_effect',
  'Aplica um efeito SVG/Illustrator pelo comando de menu ao objeto selecionado.',
  { effectName: z.string().describe('Nome do comando de menu do efeito') },
  function (p) { return tools.il_apply_effect(p); });

// 45. il_get_fonts
registerTool('il_get_fonts',
  'Lista as fontes disponíveis no sistema para uso no Illustrator.',
  { limit: z.number().int().optional().describe('Limite de fontes retornadas (padrão 100)') },
  function (p) { return tools.il_get_fonts(p); });

// 46. il_duplicate_selection
registerTool('il_duplicate_selection',
  'Duplica os objetos selecionados, deslocando as cópias por um delta.',
  {
    dx: z.number().optional().describe('Deslocamento X das cópias (padrão 10)'),
    dy: z.number().optional().describe('Deslocamento Y das cópias (padrão 10)')
  },
  function (p) { return tools.il_duplicate_selection(p); });

// 47. il_bring_to_front
registerTool('il_bring_to_front',
  'Traz os objetos selecionados para a frente (topo da pilha de camadas).',
  {}, function () { return tools.il_bring_to_front(); });

// 48. il_send_to_back
registerTool('il_send_to_back',
  'Envia os objetos selecionados para trás (fundo da pilha de camadas).',
  {}, function () { return tools.il_send_to_back(); });

// 49. il_fit_artboard_to_artwork
registerTool('il_fit_artboard_to_artwork',
  'Ajusta o artboard para encaixar exatamente no artwork existente.',
  { index: z.number().int().optional().describe('Índice do artboard (padrão: ativo)') },
  function (p) { return tools.il_fit_artboard_to_artwork(p); });

// 50. il_zoom_to_fit
registerTool('il_zoom_to_fit',
  'Ajusta o zoom para que todo o conteúdo do documento caiba na tela.',
  {}, function () { return tools.il_zoom_to_fit(); });

// ─── Inicia o servidor ────────────────────────────────────────────────────────
async function main() {
  var transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('[IL MCP] Servidor iniciado — aguardando conexões MCP via stdio\n');
}

main().catch(function (err) {
  process.stderr.write('[IL MCP] Erro fatal: ' + err.message + '\n');
  process.exit(1);
});
