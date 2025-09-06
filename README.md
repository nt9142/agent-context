# agent-context

Interactive CLI to create a scoped workspace (symlinks) for your editor.

## Install

```bash
npm install
# optional, to expose the CLI globally during development
npm link
```

## Usage

```bash
# run locally
node ./cli.mjs

# or, after linking
agent-context
agent-context --help
```

## Notes

- Auto mode creates a temporary workspace under `~/coder-work/session-YYYYMMDD-HHMM`.
- Manual mode lets you choose a target directory, then select project folders to symlink into it.
- Navigation: arrows to move, Space/Enter to select, Esc to exit.
