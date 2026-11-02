@AGENTS.md

# Shipping changes

The owner wants finished work live without a separate confirmation step. After every change:

1. Run the type check and a production build. Run the tests that cover the files you changed.
2. If they pass, commit, push the branch, open a pull request into `main` and merge it. Do not wait to be asked.
3. Confirm the Vercel deploys for the merge commit finish successfully and report the result.

If a check fails, fix it first. Never commit secrets or `.env` files. Use the GitHub REST API (`gh api`) for pull requests, since GraphQL is blocked in cloud sessions.
