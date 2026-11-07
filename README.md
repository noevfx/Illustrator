# Illustrator

Ferramentas da Noé VFX para o Adobe Illustrator. Duas pastas de projeto:

| Pasta | O que é | Pacote |
| :--- | :--- | :--- |
| `Artboard Resizer\` | Painel CEP 2.7.0 que redimensiona pranchetas. Contém `src\Artboard_Resizer\` (painel, fonte única), `instaladores\` (PC e Mac) e `scripts\build.ps1`. | `release\Artboard Resizer\v2.7.0\` |
| `Illustrator MCP & CEP Extension\` | **IL MCP Bridge 1.0.0**: painel CEP (`CEP Extension\`, id `com.ilmcp.bridge`) + servidor MCP com 50 ferramentas `il_*` (`MCP Server\`). Instalar com `instaladores\install.ps1`, remover com `instaladores\uninstall.ps1`; gerar pacote com `scripts\package-zip.ps1`. | `release\IL MCP Bridge\v1.0.0\` |

## Como funciona o IL MCP Bridge
O cliente (Claude, Codex) chama o servidor MCP (`MCP Server\index.js`, Node). Ele grava `task.json` em `%TEMP%\il_bridge`; o painel CEP aberto dentro do Illustrator lê, executa em ExtendScript e grava `result_<id>.json`. **O painel precisa estar aberto** (Janela > Extensões > IL MCP Bridge).

## Observações
- É esta versão (a pasta `Illustrator MCP & CEP Extension\`) que está instalada e foi usada de fato; o painel instalado é idêntico à fonte daqui.
- A cópia instalada é independente da fonte: depois de editar, reinstalar.
- Versão e regras de release: `D:\.IA agents\global\RELEASES.md`.
- Código descartado (cep-bridge/il-mcp-server de 21/10 e experimentos da fogueira) está em `D:\Noe VFX\.Labs\_Arquivo\Illustrator\`.