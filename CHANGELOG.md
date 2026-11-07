# Changelog — Illustrator

Versionamento semântico **por produto**. Cada versão fica em `release/vX.Y.Z/` dentro da pasta do produto (o IL MCP Bridge em `release/IL MCP Bridge/`) e não é sobrescrita (diretriz: `D:\.IA agents\global\RELEASES.md`).

## 26/10/2026
- Raiz limpa: só `Artboard Resizer\` e `Illustrator MCP & CEP Extension\` (oficial). `cep-bridge`, `il-mcp-server`, scripts e instaladores da raiz foram para `_Arquivo\Illustrator\`; experimentos da fogueira também.
- Artboard Resizer reorganizado: fonte única em `src\` (antes PC e MAC duplicados), `instaladores\` e `scripts\build.ps1`. Pacote gerado confere com o zip 2.7.0 publicado (15 arquivos, SHA-256). O zip publicado usa `\` nos nomes internos; o build usa `/`.
- `release\IL MCP Bridge\v1.0.0` passou a ser o build de 22/10 (o que funciona).

## Versões atuais

| Produto | Versão | Tipo | Pacote |
| :    | :    | :    | :    |
| Artboard Resizer | 2.7.0 | painel CEP (PC e Mac) | `release/Artboard Resizer/v2.7.0/` |
| IL MCP Bridge | 1.0.0 | servidor MCP (Node.js) + painel CEP | `release/IL MCP Bridge/v1.0.0/` |

   

## Repositório

### 2026 10 25 — Reorganização
  Zips que ficavam soltos na raiz foram para `release/<Produto>/vX.Y.Z/`; `package zip.ps1` passou a gravar direto em `release/IL MCP Bridge/vX.Y.Z/`.
  README reunido: descreve os dois produtos (antes o texto do Artboard Resizer tinha sido substituído pelo do IL MCP Bridge na pasta de trabalho).
  Existem **dois zips diferentes com o número 1.0.0 do IL MCP Bridge**: o de 21/10 (26 KB, `IL MCP Bridge v1.0.0.zip`) e um build posterior de 22/10 (53 KB, `IL MCP Bridge v1.0.0_build 2026 10 22.zip`). Foram guardados lado a lado; o próximo lançamento deve sair como `1.0.1` para acabar com a ambiguidade.

   

## Artboard Resizer

### [2.7.0] — 2026 09 22
  Painel CEP que redimensiona pranchetas e todo o artwork contido nelas, sempre gerando um arquivo novo e preservando o original.
  Redimensiona todas as pranchetas, só a ativa ou um intervalo; reconstrói o documento mantendo camadas e ordem.
  Divide em vários arquivos quando as pranchetas não cabem em um único canvas regular do Illustrator.
  Expande envelopes (Envelope Distort) antes de escalar, porque a malha do envelope não sobrevive ao salvamento.
  Grava um `_debug.txt` ao lado de cada arquivo gerado com o que aconteceu com cada item.
  Pasta de distribuição renomeada para a versão real (2.7.0) e README da distribuição atualizado.
  Versões anteriores à 2.7.0 não foram guardadas neste repositório.

## IL MCP Bridge

### [1.0.0] — 2026 10 21
  Controle do Illustrator por Model Context Protocol: servidor MCP (Node.js, 50 ferramentas) + painel CEP (`com.ilmcp.bridge`) que troca `task.json`/`result_<id>.json` com o servidor e executa ExtendScript no Illustrator.
  Instalador (`install.ps1`), desinstalador (`uninstall.ps1`) e empacotador (`package zip.ps1`).
  Compatível com Illustrator 30.x.
