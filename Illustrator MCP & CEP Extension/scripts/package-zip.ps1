# IL MCP Bridge - gerador do ZIP de release
# Uso: .\scripts\package-zip.ps1 [-Version "1.0.1"] [-Out <pasta>]
# Versao omitida = a do MCP Server\package.json. Grava em ..\release\IL MCP Bridge\vX.Y.Z\ e NAO sobrescreve release existente.
param([string]$Version = "", [string]$Out = "")
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$root = Split-Path $PSScriptRoot -Parent
if (-not $Version) { $Version = (Get-Content (Join-Path $root 'MCP Server\package.json') -Raw | ConvertFrom-Json).version }
if (-not $Out) { $Out = Join-Path (Split-Path $root -Parent) "release\IL MCP Bridge\v$Version" }
$zip = Join-Path $Out "IL-MCP-Bridge-v$Version.zip"
if (Test-Path $zip) { throw "Release ja existe (imutavel): $zip. Suba a versao." }
New-Item -ItemType Directory -Force $Out | Out-Null
$za = [IO.Compression.ZipFile]::Open($zip, 'Create')
function Add($file, $entry) { [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($za, $file, $entry, 'Optimal') }
$cep = Join-Path $root 'CEP Extension'
Get-ChildItem $cep -Recurse -File | % { Add $_.FullName ('CEP Extension/' + $_.FullName.Substring($cep.Length + 1).Replace('\','/')) }
foreach ($f in 'index.js','il-runner.js','tools.js','package.json','package-lock.json') { $p = Join-Path $root "MCP Server\$f"; if (Test-Path $p) { Add $p "MCP Server/$f" } }
foreach ($f in 'install.ps1','uninstall.ps1') { Add (Join-Path $root "instaladores\$f") $f }
foreach ($f in 'README.md','VERSIONING.md','AGENTS.md') { $p = Join-Path $root $f; if (Test-Path $p) { Add $p $f } }
$za.Dispose(); Write-Host "OK: $zip"