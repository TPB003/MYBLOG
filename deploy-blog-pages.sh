#!/usr/bin/env bash
set -euo pipefail

REPO_URL=""
BRANCH="main"
COMMIT_MESSAGE="chore: deploy blog to GitHub Pages"

usage() {
  cat <<'EOF'
Usage:
  ./deploy-blog-pages.sh --repo-url https://github.com/<user>/<repo>.git [--branch main] [--message "commit msg"]

Options:
  --repo-url   GitHub repository URL. Required if origin remote is missing.
  --branch     Branch to push (default: main).
  --message    Commit message.
EOF
}

run_git() {
  echo ">> git $*"
  git "$@"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-url)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --message)
      COMMIT_MESSAGE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if ! command -v git >/dev/null 2>&1; then
  echo "git is not installed or not in PATH."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f "blog/index.html" ]]; then
  echo "Missing blog/index.html. Run this script from the project root."
  exit 1
fi

if [[ ! -f ".github/workflows/deploy-pages.yml" ]]; then
  echo "Missing .github/workflows/deploy-pages.yml."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is not installed or not in PATH."
  exit 1
fi

if [[ ! -d ".git" ]]; then
  run_git init
fi

origin_url="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$origin_url" ]]; then
  if [[ -z "$REPO_URL" ]]; then
    echo "No origin remote found. Use --repo-url https://github.com/<user>/<repo>.git"
    exit 1
  fi
  run_git remote add origin "$REPO_URL"
fi

echo ">> generating knowledge cards from markdown"
node scripts/generate-knowledge-from-md.mjs

run_git add blog .github/workflows/deploy-pages.yml

if git diff --cached --quiet; then
  echo "No new changes to deploy."
  exit 0
fi

run_git commit -m "$COMMIT_MESSAGE"
run_git branch -M "$BRANCH"

if ! run_git push -u origin "$BRANCH"; then
  echo "Push failed, syncing remote branch and retrying once..."
  run_git pull origin "$BRANCH" --allow-unrelated-histories --no-rebase
  run_git push -u origin "$BRANCH"
fi

echo
echo "Done. GitHub Actions will deploy your site from /blog."
echo "Open the Actions tab if you want to trigger workflow manually."
