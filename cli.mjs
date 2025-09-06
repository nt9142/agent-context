#!/usr/bin/env node
import 'tsx';
import process from 'node:process';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
agent-context

Interactive CLI to create a scoped workspace (symlinks) for your editor.

Usage:
  agent-context                 # auto mode by default (falls back to manual if no write perms)
  agent-context --choose        # show mode selection UI (auto or manual)
  agent-context --manual        # force manual mode
  agent-context --help          # show this help
`);
  process.exit(0);
}

import React from 'react';
import { render } from 'ink';

const allowChoice = process.argv.includes('--choose');
const forceManual = process.argv.includes('--manual');

// Dynamically import after tsx registration so .tsx is recognized in ESM
const { default: App } = await import('./src/App.tsx');

render(React.createElement(App, { allowChoice, forceManual }));
