# ============================================================
# IL MCP Bridge — Desinstalador v1.0.0
# Illustrator MCP & CEP Extension
# ============================================================
# Execucao: clique com botao direito > "Executar com PowerShell"
# ============================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Red
Write-Host "  IL MCP Bridge - Desinstalador v1.0.0" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host ""
Write-Host "Isso ira remover:" -ForegroundColor Yellow
Write-Host "  - Extensao CEP do Illustrator (AppData)" -ForegroundColor White
Write-Host "  - Pasta de ponte temporaria (%TEMP%\il_bridge)" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Confirma remocao? (S/N)"
if ($confirm -notmatch "^[Ss]$") {
    Write-Host "Cancelado." -ForegroundColor Yellow
    exit 0
}

# ── 1. Remove extensao CEP ────────────────────────────────────
$cepDest = Join-Path $env:APPDATA "Adobe\CEP\extensions\com.ilmcp.bridge"
if (Test-Path $cepDest) {
    Remove-Item $cepDest -Recurse -Force
    Write-Host "[OK] Extensao CEP removida: $cepDest" -ForegroundColor Green
} else {
    Write-Host "[--] Extensao CEP nao encontrada (ja removida?)" -ForegroundColor Gray
}

# ── 2. Remove pasta de ponte temp ────────────────────────────
$tempBridge = Join-Path $env:TEMP "il_bridge"
if (Test-Path $tempBridge) {
    Remove-Item $tempBridge -Recurse -Force
    Write-Host "[OK] Pasta temporaria removida: $tempBridge" -ForegroundColor Green
} else {
    Write-Host "[--] Pasta temporaria nao encontrada." -ForegroundColor Gray
}

# ── 3. Remover PlayerDebugMode (opcional) ─────────────────────
Write-Host ""
$removeDebug = Read-Host "Remover PlayerDebugMode do registro? (S/N) [recomendado apenas se nao usar outras extensoes CEP]"
if ($removeDebug -match "^[Ss]$") {
    foreach ($v in @("6","7","8","9","10","11","12")) {
        $key = "HKCU:\Software\Adobe\CSXS.$v"
        if (Test-Path $key) {
            Remove-ItemProperty -Path $key -Name "PlayerDebugMode" -ErrorAction SilentlyContinue
            Write-Host "  [OK] CSXS.$v PlayerDebugMode removido" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Desinstalacao concluida!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Read-Host "Pressione Enter para fechar"
