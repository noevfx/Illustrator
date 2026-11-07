# Illustrator — ferramentas da Noé VFX

Duas ferramentas para o **Adobe Illustrator**, em forma de painéis que ficam dentro do próprio programa.

## O que tem aqui

| Ferramenta | Para que serve | Versão | Baixar |
| :--- | :--- | :--- | :--- |
| **Artboard Resizer** | Redimensiona pranchetas (artboards) de forma rápida e precisa | 2.7.0 | [zip](release/Artboard%20Resizer/v2.7.0/Artboard-Resizer-v2.7.0.zip) |
| **IL MCP Bridge** | Deixa assistentes de IA (Claude, Codex) controlarem o Illustrator, com 50 ferramentas `il_*` | 1.0.0 | [zip](release/IL%20MCP%20Bridge/v1.0.0/IL-MCP-Bridge-v1.0.0.zip) |

## Como instalar o Artboard Resizer

1. Baixe o zip e extraia.
2. Windows: abra a pasta `PC` e rode `Install_Artboard_Resizer.bat`. Mac: na pasta `MAC`, rode `Install_Artboard_Resizer.command`.
3. Reinicie o Illustrator e abra o painel em **Janela → Extensões → Artboard Resizer**.

Para remover, use o `Uninstall_…` da mesma pasta.

## Como instalar o IL MCP Bridge

1. Baixe o zip e extraia.
2. Rode `install.ps1` (clique com o botão direito → *Executar com PowerShell*). Para remover: `uninstall.ps1`.
3. Reinicie o Illustrator e abra **Janela → Extensões → IL MCP Bridge**. **O painel precisa ficar aberto** para a IA conseguir agir.

Requer o [Node.js](https://nodejs.org) instalado.

### Como funciona

```
Assistente de IA ─▶ servidor MCP (Node.js) ─▶ painel CEP dentro do Illustrator ─▶ ExtendScript
```

O servidor grava um pedido (`task.json`) numa pasta temporária, o painel lê, executa no Illustrator e devolve o resultado. A cópia instalada é independente da fonte: depois de editar o código, reinstale.

## Estrutura do repositório

```text
Illustrator/
├─ Artboard Resizer/                  código do painel, instaladores (PC e Mac) e script de build
├─ Illustrator MCP & CEP Extension/   painel CEP (CEP Extension) e servidor MCP (MCP Server)
├─ release/<Ferramenta>/vX.Y.Z/       pacote de cada versão (ordem crescente, nada é sobrescrito)
├─ CHANGELOG.md                       histórico de versões
└─ HANDOFF.md  VERSIONING.md          como continuar o projeto e regra de versões
```

## Versões

Versionamento `MAJOR.MINOR.PATCH`. Histórico no [CHANGELOG](CHANGELOG.md); regra em [VERSIONING.md](VERSIONING.md).

## Contato

Noé VFX — [noevfx.com](https://noevfx.com) · [labs@noevfx.com](mailto:labs@noevfx.com)

Adobe e Illustrator são marcas da Adobe. Estas ferramentas são independentes e não são afiliadas nem endossadas pela Adobe.
