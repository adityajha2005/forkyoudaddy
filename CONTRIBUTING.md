## Contributing to ForkYouDaddy

Thanks for taking the time to contribute. Please follow these guidelines to streamline reviews and maintain quality.

### Workflow
- Create an issue describing the change before large work begins
- Fork the repo and create a feature branch: `feat/<short-context>` or `fix/<short-context>`
- Keep PRs focused and small; include a clear description and screenshots where relevant
- Reference related issues in the PR description (e.g., "Closes #123")

### Code
- Use TypeScript with clear, descriptive names
- Prefer early returns; avoid deep nesting
- Handle errors meaningfully; avoid silent catches
- Follow existing formatting and lint rules (`npm run lint`)

### Tests and verification
- Build locally: `npm run build`
- Run the app: `npm run dev`
- When you change behavior, update documentation and any relevant comments

### Commits
- Write clear, imperative messages (e.g., "Add IPFS upload fallback")
- Squash fixups where appropriate before merge

### Security
- Do not commit secrets or credentials
- Treat `.env` values as sensitive and use `.env.example` for placeholders

### Communication
- Be specific about trade-offs and alternatives considered
- If something is experimental or a temporary workaround, call that out
