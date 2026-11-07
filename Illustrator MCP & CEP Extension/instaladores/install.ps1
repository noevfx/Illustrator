# ============================================================
# IL MCP Bridge — Instalador v1.0.0
# Illustrator MCP & CEP Extension
# ============================================================
# Execucao: clique com botao direito > "Executar com PowerShell"
# Nao requer permissao de administrador.
# ============================================================

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root      = if (Test-Path (Join-Path $scriptDir "CEP Extension")) { $scriptDir } else { Split-Path -Parent $scriptDir }   # zip extraido: tudo ao lado; pasta do projeto: um nivel acima

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  IL MCP Bridge - Instalador v1.0.0" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Verificar Node.js ──────────────────────────────────────
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = node --version 2>&1
    Write-Host "      Node.js encontrado: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js nao encontrado. Instale em https://nodejs.org" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# ── 2. Habilitar PlayerDebugMode (CEP nao assinado) ──────────
Write-Host "[2/5] Habilitando CEP Debug Mode no registro..." -ForegroundColor Yellow
foreach ($v in @("6","7","8","9","10","11","12")) {
    $key = "HKCU:\Software\Adobe\CSXS.$v"
    New-Item -Path $key -Force -ErrorAction SilentlyContinue | Out-Null
    New-ItemProperty -Path $key -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force | Out-Null
}
Write-Host "      PlayerDebugMode habilitado para CSXS.6 - CSXS.12" -ForegroundColor Green

# ── 3. Instalar extensao CEP ─────────────────────────────────
Write-Host "[3/5] Instalando extensao CEP no Illustrator..." -ForegroundColor Yellow
$cepSrc  = Join-Path $root "CEP Extension"
$cepDest = Join-Path $env:APPDATA "Adobe\CEP\extensions\com.ilmcp.bridge"

New-Item -ItemType Directory -Path $cepDest -Force | Out-Null
Copy-Item -Path "$cepSrc\*" -Destination $cepDest -Recurse -Force
Write-Host "      Extensao instalada em: $cepDest" -ForegroundColor Green

# ── 4. Instalar dependencias Node ────────────────────────────
Write-Host "[4/5] Instalando dependencias Node.js (MCP Server)..." -ForegroundColor Yellow
$mcpDir = Join-Path $root "MCP Server"
Set-Location $mcpDir
npm install --prefer-offline 2>&1 | Where-Object { $_ -match "added|found|vulnerabilities" } | ForEach-Object { Write-Host "      $_" }

# Cria pastas da ponte
New-Item -ItemType Directory -Path (Join-Path $mcpDir ".il_bridge") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $env:TEMP "il_bridge")  -Force -ErrorAction SilentlyContinue | Out-Null
Write-Host "      Dependencias instaladas." -ForegroundColor Green

# ── 5. Exibir config MCP ──────────────────────────────────────
Write-Host "[5/5] Configuracao do MCP para o Antigravity/AGY:" -ForegroundColor Yellow
$indexPath = (Join-Path $mcpDir "index.js") -replace "\\", "/"
Write-Host ""
Write-Host '  Adicione ao mcp_servers.json do Antigravity:' -ForegroundColor Cyan
Write-Host ""
Write-Host "  {" -ForegroundColor White
Write-Host "    `"il-mcp-server`": {" -ForegroundColor White
Write-Host "      `"command`": `"node`"," -ForegroundColor White
Write-Host "      `"args`": [`"$indexPath`"]" -ForegroundColor White
Write-Host "    }" -ForegroundColor White
Write-Host "  }" -ForegroundColor White
Write-Host ""

# ── Resultado final ───────────────────────────────────────────
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Instalacao concluida com sucesso!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Abra o Adobe Illustrator" -ForegroundColor White
Write-Host "  2. Va em Window > Extensions > IL MCP Bridge" -ForegroundColor White
Write-Host "  3. O painel deve mostrar: 'Aguardando tarefas...'" -ForegroundColor White
Write-Host "  4. Reinicie o Antigravity/AGY para carregar o servidor MCP" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para fechar"
