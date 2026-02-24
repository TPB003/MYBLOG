# GitHub Pages One-Click Deploy

## 1) First deployment

1. Create an empty GitHub repo (do not add README/license in GitHub UI).
2. In `d:\stud`, run:

```powershell
.\deploy-blog-pages.ps1 -RepoUrl https://github.com/<your-user>/<your-repo>.git
```

3. Open GitHub repo Settings -> Pages, set Source to `GitHub Actions` (one-time setup).
4. Wait for workflow `Deploy Blog to GitHub Pages` to finish.
5. Your site URL will be:

```text
https://<your-user>.github.io/<your-repo>/
```

## 2) Update after editing

After modifying files in `blog/`, run:

```powershell
.\deploy-blog-pages.ps1
```

This will commit + push and trigger deployment again.
