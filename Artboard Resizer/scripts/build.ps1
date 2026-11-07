# Gera release\vX.Y.Z\Artboard-Resizer-vX.Y.Z.zip no layout PC\ + MAC\ (painel copiado em cada um).
# Uso: .\scripts\build.ps1 [-Out <pasta>]   (nao sobrescreve release publicada: falha se o zip ja existir)
param([string]$Out)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$root = Split-Path $PSScriptRoot -Parent
$ver  = ([xml](Get-Content (Join-Path $root 'src\Artboard_Resizer\CSXS\manifest.xml') -Raw)).ExtensionManifest.ExtensionBundleVersion
if (-not $Out) { $Out = Join-Path (Split-Path $root -Parent) "release\Artboard Resizer\v$ver" }
$zip = Join-Path $Out "Artboard-Resizer-v$ver.zip"
if (Test-Path $zip) { throw "Release ja existe (imutavel): $zip. Suba a versao." }
New-Item -ItemType Directory -Force $Out | Out-Null
$za = [IO.Compression.ZipFile]::Open($zip, 'Create')
function Add($file, $entry) { [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($za, $file, $entry, 'Optimal') }
foreach ($os in 'PC','MAC') {
  Get-ChildItem (Join-Path $root "instaladores\$os") -File | % { Add $_.FullName "$os/$($_.Name)" }
  $src = Join-Path $root 'src\Artboard_Resizer'
  Get-ChildItem $src -Recurse -File | % { Add $_.FullName ("$os/Artboard_Resizer/" + $_.FullName.Substring($src.Length + 1).Replace('\','/')) }
}
Add (Join-Path $root 'instaladores\LEIA-ME_instalacao.txt') 'README.txt'
$za.Dispose(); Write-Host "OK: $zip"