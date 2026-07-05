---
sidebar_position: 2
---

# Contributing

Thank you for contributing to Dyma open source.

## Where to contribute

| Goal | Channel |
|------|---------|
| Bug or feature in a repo | Open an issue, then a pull request in that repository |
| Questions and ideas | [Organization Discussions](https://github.com/orgs/Dyma-IO/discussions) |
| Documentation fixes | Pull request to [`dyma-docs`](https://github.com/Dyma-IO/dyma-docs) |
| Security vulnerabilities | Email [dymaweb3@gmail.com](mailto:dymaweb3@gmail.com) privately |

## Pull request workflow

1. Open or comment on an issue before large changes.
2. Fork the repository and branch from `main`.
3. Keep commits focused with clear messages.
4. Open a PR with description and test plan.
5. Ensure CI passes before requesting review.

## Standards

- Match existing code style and conventions.
- Add or update tests for behavior changes.
- Never commit secrets, `.env` files, or credentials.
- Reference issue numbers in PR descriptions when applicable.

## Code of conduct

All contributors are expected to follow the [Contributor Covenant](https://github.com/Dyma-IO/.github/blob/main/CODE_OF_CONDUCT.md) in org-wide community spaces.

## Editing this documentation

Documentation source lives in the `docs/` folder of `dyma-docs`. Pages use Markdown with optional front matter:

```markdown
---
sidebar_position: 1
---

# Page title
```

After editing locally, run `npm run build` to verify links before opening a PR.
