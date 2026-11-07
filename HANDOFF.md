# HANDOFF — Illustrator

## Estado (26/10/2026)
```
Illustrator\
├─ Artboard Resizer\                  painel 2.7.0: src\ (fonte única), instaladores\ (PC e Mac), scripts\build.ps1
├─ Illustrator MCP & CEP Extension\   IL MCP Bridge 1.0.0 (CEP Extension\, MCP Server\, instaladores\ com install/uninstall, scripts\package-zip.ps1)
├─ release\IL MCP Bridge\vX.Y.Z\      pacotes de cada produto e versão
└─ README, CHANGELOG, HANDOFF, AGENTS, CLAUDE, VERSIONING, .gitignore (docs na raiz, como no After Effects)
```
- **Oficial:** a pasta `Illustrator MCP & CEP Extension\`. Conferido: painel instalado = `CEP Extension\`; servidor sobe e lista as 50 ferramentas; último uso real do bridge em 22/10. Não testado ao vivo hoje (exige abrir o painel dentro do Illustrator).
- O zip `release\IL MCP Bridge\v1.0.0\IL-MCP-Bridge-v1.0.0.zip` é o build de 22/10 (o que funciona), gerado por `scripts\package-zip.ps1` (que grava em `release\IL MCP Bridge\vX.Y.Z\`, sem sobrescrever).
- Arquivado em `_Arquivo\Illustrator\`: `raiz-antiga\` (cep-bridge, il-mcp-server, scripts, install/uninstall/package-zip, zip de 21/10) e `experimentos-antigos\` (vetorização da fogueira).

## Pendências
- **Git atrasado:** só o Artboard Resizer 2.7.0 está commitado; o resto está sem commit. Commitar só com "Finalizado, pode subir". Push só com "pode subir pro git" (conta `noevfx`).
- Pasta oficial ainda sem teste ao vivo no Illustrator.