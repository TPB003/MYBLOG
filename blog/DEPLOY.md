# GitHub Pages One-Click Deploy

## Linux terminal (recommended)

### 1) First deployment

1. Create an empty GitHub repo.
2. In project root, run:

```bash
chmod +x ./deploy-blog-pages.sh
./deploy-blog-pages.sh --repo-url https://github.com/<your-user>/<your-repo>.git
```

3. Open GitHub repo `Settings -> Pages`, set Source to `GitHub Actions` (one-time setup).
4. Wait for workflow `Deploy Blog to GitHub Pages` to finish.
5. Site URL:

```text
https://<your-user>.github.io/<your-repo>/
```

### 2) Deploy updates

After editing files in `blog/`, run:

```bash
./deploy-blog-pages.sh
```

## PowerShell alternative

```powershell
.\deploy-blog-pages.ps1 -RepoUrl https://github.com/<your-user>/<your-repo>.git
```
