# Secure S3-compatible credential injection (Windows PowerShell 5.1+)
#
# Provider-agnostic: AWS S3 (primary), Cloudflare R2 (fallback), or LocalStack.
# Writes canonical S3_* variables to a git-ignored .env file.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1 -Provider aws -EnvFile .\backend\.env
#   powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1 -Provider aws -SourceEnvFile .\.env -NonInteractive
#
# Prompts with hidden input for the secret key, never echoes values, and replaces
# only S3_*/R2_* keys plus this script's own injection comment. Safe to re-run.

[CmdletBinding()]
param(
  [ValidateSet("aws", "r2", "localstack")]
  [string]$Provider,
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\backend\.env"),
  [string]$SourceEnvFile,
  [string]$Endpoint,
  [string]$Region,
  [string]$UploadsBucket,
  [string]$BackupsBucket,
  [string]$PublicBaseUrl,
  [string]$ForcePathStyle,
  [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
$EnvFile = [System.IO.Path]::GetFullPath($EnvFile)
$dir = Split-Path -Parent $EnvFile
if (-not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

function Read-DotEnv {
  param([string]$Path)

  $map = @{}
  if (-not (Test-Path -LiteralPath $Path)) { return $map }

  foreach ($line in [System.IO.File]::ReadAllLines($Path)) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
      $name = $matches[1]
      $value = $matches[2].Trim()
      if (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
      ) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      $map[$name] = $value
    }
  }
  return $map
}

function Resolve-Value {
  param(
    [string]$Label,
    [string]$Supplied,
    [string]$Default,
    [bool]$Required,
    [bool]$SkipPrompt
  )

  if (-not [string]::IsNullOrWhiteSpace($Supplied)) { return $Supplied.Trim() }

  if ($SkipPrompt) {
    if (-not [string]::IsNullOrWhiteSpace($Default)) { return $Default }
    if ($Required) { throw "$Label is required in non-interactive mode." }
    return ""
  }

  $suffix = if ([string]::IsNullOrWhiteSpace($Default)) { "" } else { " [$Default]" }
  $answer = Read-Host "$Label$suffix"
  if ([string]::IsNullOrWhiteSpace($answer)) { $answer = $Default }
  if ($Required -and [string]::IsNullOrWhiteSpace($answer)) { throw "$Label is required." }
  return $answer.Trim()
}

if ([string]::IsNullOrWhiteSpace($Provider)) {
  if ($NonInteractive) { $Provider = "aws" }
  else {
    $answer = Read-Host "Storage provider (aws, r2, localstack) [aws]"
    if ([string]::IsNullOrWhiteSpace($answer)) { $answer = "aws" }
    $Provider = $answer.Trim().ToLowerInvariant()
  }
}
if (@("aws", "r2", "localstack") -notcontains $Provider) {
  throw "Unknown provider '$Provider'. Use aws, r2, or localstack."
}

switch ($Provider) {
  "aws" { $defaultEndpoint = ""; $defaultRegion = "eu-north-1"; $defaultForce = "false" }
  "r2" { $defaultEndpoint = ""; $defaultRegion = "auto"; $defaultForce = "true" }
  "localstack" { $defaultEndpoint = "http://localhost:4566"; $defaultRegion = "us-east-1"; $defaultForce = "true" }
}

$sourceValues = @{}
if (-not [string]::IsNullOrWhiteSpace($SourceEnvFile)) {
  $sourcePath = [System.IO.Path]::GetFullPath($SourceEnvFile)
  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source env file not found: $sourcePath"
  }
  $sourceValues = Read-DotEnv -Path $sourcePath
  Write-Host "Reading credentials from: $sourcePath"
}

Write-Host ""
Write-Host "Injecting S3-compatible storage settings ($Provider) into: $EnvFile"
Write-Host "Values are not echoed. Press Enter to accept [defaults]."
Write-Host ""

if ($Provider -eq "aws") {
  $endpoint = Resolve-Value "S3 endpoint URL (leave blank for real AWS S3)" $Endpoint "" $false $NonInteractive.IsPresent
} else {
  $endpoint = Resolve-Value "S3 endpoint URL" $Endpoint $defaultEndpoint $true $NonInteractive.IsPresent
}
if ($Provider -eq "r2" -and [string]::IsNullOrWhiteSpace($endpoint)) {
  throw "R2 endpoint URL is required (https://<account-id>.r2.cloudflarestorage.com)."
}

if ($Provider -eq "localstack") {
  $accessKey = "test"
  $secretKey = "test"
  Write-Host "Using LocalStack test credentials (test/test)."
} else {
  $accessKey = $null
  foreach ($name in @("S3_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID", "ACCESS_KEY", "R2_ACCESS_KEY_ID")) {
    if ($sourceValues.ContainsKey($name) -and -not [string]::IsNullOrWhiteSpace($sourceValues[$name])) {
      $accessKey = $sourceValues[$name]
      break
    }
  }

  $secretKey = $null
  foreach ($name in @("S3_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY", "SECRET_ACCESS_KEY", "R2_SECRET_ACCESS_KEY")) {
    if ($sourceValues.ContainsKey($name) -and -not [string]::IsNullOrWhiteSpace($sourceValues[$name])) {
      $secretKey = $sourceValues[$name]
      break
    }
  }

  if ([string]::IsNullOrWhiteSpace($accessKey)) {
    if ($NonInteractive) { throw "S3 access key ID is required (use -SourceEnvFile or run interactively)." }
    $accessKey = Read-Host "S3 access key ID"
    if ([string]::IsNullOrWhiteSpace($accessKey)) { throw "S3 access key ID is required." }
  }

  if ([string]::IsNullOrWhiteSpace($secretKey)) {
    if ($NonInteractive) { throw "S3 secret access key is required (use -SourceEnvFile or run interactively)." }
    $secretSecure = Read-Host "S3 secret access key" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretSecure)
    try {
      $secretKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    if ([string]::IsNullOrWhiteSpace($secretKey)) { throw "S3 secret access key is required." }
  }
}

$region = Resolve-Value "S3 region" $Region $defaultRegion $true $NonInteractive.IsPresent
$uploads = Resolve-Value "S3 uploads bucket" $UploadsBucket "parsswim-uploads" $true $NonInteractive.IsPresent
$backups = Resolve-Value "S3 backups bucket" $BackupsBucket "parsswim-backups" $true $NonInteractive.IsPresent

if ($Provider -eq "aws") {
  $defaultPublic = "https://$uploads.s3.$region.amazonaws.com"
}
elseif ($Provider -eq "localstack") {
  $defaultPublic = "$($endpoint.TrimEnd('/'))/$uploads"
}
else {
  $defaultPublic = ""
}

$publicBase = Resolve-Value "Public base URL for uploads" $PublicBaseUrl $defaultPublic ($Provider -eq "r2") $NonInteractive.IsPresent
if ($Provider -eq "r2" -and [string]::IsNullOrWhiteSpace($publicBase)) {
  throw "Public base URL is required for public R2 images."
}

$forcePathStyle = Resolve-Value "S3_FORCE_PATH_STYLE (true/false)" $ForcePathStyle $defaultForce $false $NonInteractive.IsPresent

$values = [ordered]@{
  S3_ENDPOINT          = $endpoint
  S3_ACCESS_KEY_ID     = $accessKey
  S3_SECRET_ACCESS_KEY = $secretKey
  S3_REGION            = $region
  S3_UPLOADS_BUCKET    = $uploads
  S3_BACKUPS_BUCKET    = $backups
  S3_PUBLIC_BASE_URL   = $publicBase
  S3_FORCE_PATH_STYLE  = $forcePathStyle
}

$existing = @()
if (Test-Path -LiteralPath $EnvFile) {
  $existing = [System.IO.File]::ReadAllLines($EnvFile)
}

# Replace canonical S3_* keys and legacy R2_* keys; leave AWS_* alone because
# they may be shared with other tooling on the host.
$managed = @($values.Keys) + @(
  "R2_ENDPOINT_URL",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_REGION"
)

$kept = @()
foreach ($line in $existing) {
  if ($line -match '^\s*#\s*(Cloudflare R2|Object storage)\s*\(.*injected') { continue }

  $isManaged = $false
  foreach ($key in $managed) {
    if ($line -match "^\s*$([regex]::Escape($key))\s*=") { $isManaged = $true; break }
  }
  if (-not $isManaged) { $kept += $line }
}

if ($kept.Count -gt 0 -and $kept[-1].Trim() -ne "") { $kept += "" }
$kept += "# Object storage (S3-compatible, provider: $Provider; injected $(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
foreach ($key in $values.Keys) { $kept += "$key=$($values[$key])" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($EnvFile, $kept, $utf8NoBom)

$secretKey = $null
Remove-Variable secretKey -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done. Wrote: $($managed -join ', ')"
Write-Host "File: $EnvFile (git-ignored; never commit it)"
