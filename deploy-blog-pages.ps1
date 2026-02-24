param(
  [string]$RepoUrl,
  [string]$Branch = "main",
  [string]$CommitMessage = "chore: deploy blog to GitHub Pages"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Run-Git {
  param([string[]]$GitArgs)
  Write-Host ">> git $($GitArgs -join ' ')"
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git command failed: git $($GitArgs -join ' ')"
  }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git is not installed or not in PATH."
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Test-Path "blog/index.html")) {
  throw "Missing blog/index.html. Run this script from the project root."
}

if (-not (Test-Path ".github/workflows/deploy-pages.yml")) {
  throw "Missing .github/workflows/deploy-pages.yml."
}

if (-not (Test-Path ".git")) {
  Run-Git -GitArgs @("init")
}

$originUrl = ""
try {
  $originLookup = & git remote get-url origin 2>$null
  if ($LASTEXITCODE -eq 0) {
    $originUrl = ($originLookup | Out-String).Trim()
  }
}
catch {
  $originUrl = ""
}

if ([string]::IsNullOrWhiteSpace($originUrl)) {
  if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
    throw "No origin remote found. Use -RepoUrl https://github.com/<user>/<repo>.git"
  }
  Run-Git -GitArgs @("remote", "add", "origin", $RepoUrl)
}

Run-Git -GitArgs @("add", "blog", ".github/workflows/deploy-pages.yml")

$staged = (& git diff --cached --name-only | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "No new changes to deploy."
  exit 0
}

Run-Git -GitArgs @("commit", "-m", $CommitMessage)
Run-Git -GitArgs @("branch", "-M", $Branch)
try {
  Run-Git -GitArgs @("push", "-u", "origin", $Branch)
}
catch {
  Write-Host "Push failed, syncing remote branch and retrying once..."
  Run-Git -GitArgs @("pull", "origin", $Branch, "--allow-unrelated-histories", "--no-rebase")
  Run-Git -GitArgs @("push", "-u", "origin", $Branch)
}

Write-Host ""
Write-Host "Done. GitHub Actions will deploy your site from /blog."
Write-Host "Open the Actions tab if you want to trigger workflow manually."
