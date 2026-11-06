---
name: "Git Commit and PR Identity"
description: "Use when creating Git commits or pull requests in this repository. Require buchasia-bot as the Git author and authenticated GitHub account."
applyTo: "**"
---
# Git Commit and PR Identity

- Before creating a commit, verify `git var GIT_AUTHOR_IDENT` identifies `buchasia-bot`.
- Do not add a `Co-authored-by` trailer to commits in this repository.
- Before creating a pull request, verify the authenticated GitHub account is `buchasia-bot`. For GitHub CLI, check `gh api user --jq .login`; when using another PR tool, verify the account that tool will use.
- Do not assume the Git author, GitHub CLI account, and VS Code GitHub account are the same.
- If either required identity is not `buchasia-bot`, stop before committing or creating the PR and ask the user to switch identities. Do not silently change global Git settings or authentication, and never request credentials.
