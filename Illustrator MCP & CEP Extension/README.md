# IL MCP Bridge

**Controle o Adobe Illustrator via Model Context Protocol (MCP)**
> Versão 1.0.0 | Compatível com Illustrator 30.x (ILST)

---

## Por que CEP e não COM?

O Adobe Illustrator **não expõe uma API COM/scripting host** acessível externamente como o After Effects faz via AE scripting host.  
A solução mais robusta é usar o **CEP (Common Extensibility Platform)** — o framework nativo da Adobe para painéis HTML5 dentro dos aplicativos. O painel CEP roda em Node.js dentro do Illustrator, monitora arquivos de tarefas e executa ExtendScript diretamente, devolvendo resultados via arquivo.

```
Claude/AGY  ──→  MCP Server (Node.js)  ──→  arquivo task.json  ──→  Painel CEP  ──→  ExtendScript (Illustrator)
                                        ←──  result_<id>.json  ←──
```

---

## Instalação

### Automática (recomendado)
```powershell
cd D:\Noe VFX\.Labs\Illustrator
.\install.ps1
```

### Manual
1. **Copie a extensão CEP:**
   ```powershell
   Copy-Item -Recurse -Force .\cep-bridge\ "$env:APPDATA\Adobe\CEP\extensions\com.ilmcp.bridge"
   ```

2. **Habilite o modo debug CEP** (necessário para extensões não assinadas):
   ```powershell
   Set-ItemProperty "HKCU:\Software\Adobe\CSXS.9" "PlayerDebugMode" "1"
   ```
   Repita para CSXS.7 a CSXS.12 conforme sua versão do Illustrator.

3. **Instale as dependências Node.js:**
   ```powershell
   cd il-mcp-server
   npm install
   ```

4. **Crie as pastas da ponte:**
   ```powershell
   New-Item -ItemType Directory -Force "$env:TEMP\il_bridge"
   New-Item -ItemType Directory -Force ".\il-mcp-server\.il_bridge"
   ```

---

## Como usar no Antigravity / Claude

Adicione ao seu `mcp_servers` config (ex: `C:\Users\enn_g\.gemini\antigravity\mcp.json`):

```json
{
  "il-mcp-server": {
    "command": "node",
    "args": ["D:/Noe VFX/.Labs/Illustrator/il-mcp-server/index.js"]
  }
}
```

### Workflow no Illustrator
1. Abra o Illustrator
2. Vá em **Window > Extensions > IL MCP Bridge**
3. O painel deve mostrar "Aguardando tarefas..."
4. Agora o Claude pode controlar o Illustrator via MCP!

---

## Desinstalação
```powershell
.\uninstall.ps1
```

---

## Tools disponíveis (50)

| # | Tool | Descrição |
|---|------|-----------|
| 1 | `il_get_document_info` | Informações do documento ativo |
| 2 | `il_execute_script` | Executa ExtendScript livre |
| 3 | `il_get_layers` | Lista camadas |
| 4 | `il_create_layer` | Cria nova camada |
| 5 | `il_delete_layer` | Remove camada |
| 6 | `il_set_layer_visibility` | Mostra/oculta camada |
| 7 | `il_lock_layer` | Bloqueia/desbloqueia camada |
| 8 | `il_move_layer` | Reordena camada |
| 9 | `il_get_selection` | Info dos objetos selecionados |
| 10 | `il_select_all` | Seleciona tudo |
| 11 | `il_deselect` | Remove seleção |
| 12 | `il_select_by_name` | Seleciona objeto pelo nome |
| 13 | `il_create_rectangle` | Cria retângulo |
| 14 | `il_create_ellipse` | Cria elipse/círculo |
| 15 | `il_create_path` | Cria path com pontos |
| 16 | `il_create_text` | Cria text frame |
| 17 | `il_update_text` | Atualiza conteúdo de texto |
| 18 | `il_set_fill_color` | Define cor de preenchimento |
| 19 | `il_set_stroke_color` | Define cor de contorno |
| 20 | `il_set_stroke_width` | Define espessura do contorno |
| 21 | `il_apply_opacity` | Define opacidade |
| 22 | `il_group_selection` | Agrupa seleção |
| 23 | `il_ungroup_selection` | Desagrupa seleção |
| 24 | `il_move_selection` | Move seleção por delta |
| 25 | `il_resize_selection` | Redimensiona seleção (%) |
| 26 | `il_rotate_selection` | Rotaciona seleção |
| 27 | `il_align_objects` | Alinha objetos |
| 28 | `il_distribute_objects` | Distribui objetos |
| 29 | `il_get_artboards` | Lista artboards |
| 30 | `il_add_artboard` | Adiciona artboard |
| 31 | `il_set_active_artboard` | Ativa artboard |
| 32 | `il_export_svg` | Exporta como SVG |
| 33 | `il_export_png` | Exporta como PNG |
| 34 | `il_export_pdf` | Exporta como PDF |
| 35 | `il_save_document` | Salva documento |
| 36 | `il_open_document` | Abre arquivo |
| 37 | `il_close_document` | Fecha documento |
| 38 | `il_create_document` | Cria novo documento |
| 39 | `il_get_swatches` | Lista amostras de cor |
| 40 | `il_add_guide` | Adiciona guia |
| 41 | `il_clear_guides` | Remove todas as guias |
| 42 | `il_get_symbols` | Lista símbolos |
| 43 | `il_place_image` | Coloca imagem externa |
| 44 | `il_apply_effect` | Aplica efeito por comando de menu |
| 45 | `il_get_fonts` | Lista fontes disponíveis |
| 46 | `il_duplicate_selection` | Duplica seleção |
| 47 | `il_bring_to_front` | Traz para frente |
| 48 | `il_send_to_back` | Envia para trás |
| 49 | `il_fit_artboard_to_artwork` | Ajusta artboard ao artwork |
| 50 | `il_zoom_to_fit` | Zoom para caber na tela |

---

## Troubleshooting

### "Extensão não aparece em Window > Extensions"
- Verifique se o `PlayerDebugMode` foi configurado no registro.
- Certifique-se que copiou para `%APPDATA%\Adobe\CEP\extensions\com.ilmcp.bridge`.
- Reinicie o Illustrator após instalar.

### "Timeout: Illustrator não respondeu"
- O painel **IL MCP Bridge deve estar aberto** em Window > Extensions.
- O Illustrator não pode ter diálogos modais abertos.
- Aumente `TASK_TIMEOUT_MS` em `il-runner.js` se necessário.

### "EvalScript error"
- Verifique se o ExtendScript no host.jsx está correto.
- Confirme que o painel está carregado (recarregue via Developer Tools se necessário).

### Verificar se a ponte está funcionando
```powershell
cd D:\Noe VFX\.Labs\Illustrator\il-mcp-server
node -e "var r=require('./il-runner.js'); r.runScript('ilmcp_toJSON({ok:true})').then(console.log).catch(console.error)"
```
(Com o painel CEP aberto no Illustrator)

---

## Estrutura de arquivos

```
D:\Noe VFX\.Labs\Illustrator\
├── cep-bridge\
│   ├── CSXS\manifest.xml
│   ├── index.html
│   ├── js\main.js
│   └── jsx\host.jsx
├── il-mcp-server\
│   ├── package.json
│   ├── index.js
│   ├── il-runner.js
│   ├── tools.js
│   └── .il_bridge\
├── scripts\
│   ├── Criar_Coracao.jsx
│   ├── Criar_Grid.jsx
│   └── Exportar_Artboards_SVG.jsx
├── install.ps1
├── uninstall.ps1
├── package-zip.ps1
└── README.md
```

---

## Créditos

Desenvolvido para o ecossistema **Noé VFX**
Baseado no padrão AE MCP Bridge (CEP + Node MCP Server)
Versão 1.0.0 | Outubro 2026
