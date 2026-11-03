# Secure AWS S3 credential injection (Windows PowerShell 5.1+)
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\init-aws-env.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\init-aws-env.ps1 -EnvFile .\backend\.env
#
# Prompts with hidden input for the secret key, never echoes values, and writes
# only to a git-ignored .env file. Safe to re-run; it replaces managed keys only.

[CmdletBinding()]
param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\backend\.env")
)

$ErrorActionPreference = "Stop"
$EnvFile = [System.IO.Path]::GetFullPath($EnvFile)
$dir = Split-Path -Parent $EnvFile
if (-not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "Injecting AWS S3 settings into: $EnvFile"
Write-Host "Values are not echoed. Press Enter to accept [defaults]."
Write-Host ""

$region = Read-Host "AWS region [eu-west-2]"
if ([string]::IsNullOrWhiteSpace($region)) { $region = "eu-west-2" }

$uploads = Read-Host "S3 uploads bucket [parsswim-uploads]"
if ([string]::IsNullOrWhiteSpace($uploads)) { $uploads = "parsswim-uploads" }

$backups = Read-Host "S3 backups bucket [parsswim-backups]"
if ([string]::IsNullOrWhiteSpace($backups)) { $backups = "parsswim-backups" }

$accessKey = Read-Host "AWS access key ID"
if ([string]::IsNullOrWhiteSpace($accessKey)) { throw "Access key ID is required." }

$secretSecure = Read-Host "AWS secret access key" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretSecure)
try {
  $secretKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if ([string]::IsNullOrWhiteSpace($secretKey)) { throw "Secret access key is required." }

$values = [ordered]@{
  AWS_REGION            = $region
  AWS_ACCESS_KEY_ID     = $accessKey
  AWS_SECRET_ACCESS_KEY = $secretKey
  S3_UPLOADS_BUCKET     = $uploads
  S3_BACKUPS_BUCKET     = $backups
}

$existing = @()
if (Test-Path -LiteralPath $EnvFile) {
  $existing = [System.IO.File]::ReadAllLines($EnvFile)
}

$managed = @($values.Keys)
$kept = @()
foreach ($line in $existing) {
  $isManaged = $false
  foreach ($key in $managed) {
    if ($line -match "^\s*$([regex]::Escape($key))\s*=") { $isManaged = $true; break }
  }
  if (-not $isManaged) { $kept += $line }
}

if ($kept.Count -gt 0 -and $kept[-1].Trim() -ne "") { $kept += "" }
$kept += "# AWS S3 (injected $(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
foreach ($key in $values.Keys) { $kept += "$key=$($values[$key])" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($EnvFile, $kept, $utf8NoBom)

$secretKey = $null
Remove-Variable secretKey -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done. Wrote: $($managed -join ', ')"
Write-Host "File: $EnvFile (git-ignored; never commit it)"
