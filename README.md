# 🔗 Agent Context

[![npm version](https://img.shields.io/npm/v/agent-context.svg)](https://www.npmjs.com/package/agent-context)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dt/agent-context.svg)](https://www.npmjs.com/package/agent-context)
![Cross-Platform](https://img.shields.io/badge/platform-win%20|%20macos%20|%20linux-informational)

**Build an LLM agent's working context by symlinking selected folders into a single workspace.**

Transform scattered project folders into a unified workspace for **AI coding assistants** and **agents**. Perfect for **Claude Code**, **Cursor**, **Windsurf**, **GitHub Copilot**, **Qwen Coder**, **CodeGPT**, **Tabnine**, **Aider**, **StarCoder**, **CodeT5**, and other **LLM-powered development tools**. Boost productivity by providing agents with focused, organized project context.

Quick start: `npx agent-context`

## Table of Contents

- [Why Agent Context?](#why-agent-context)
- [Features](#features)
- [Installation](#installation)
  - [Quick Start with npx](#quick-start-with-npx)
  - [Global Installation](#global-installation)
- [Usage](#usage)
  - [Interactive Mode](#interactive-mode)
  - [Keyboard Controls](#keyboard-controls)
- [Use Cases](#use-cases)
- [Workflow Examples](#workflow-examples)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Why Agent Context?

Modern **AI coding assistants** and **LLM agents** work best when they have clear, organized access to your project files. Instead of juggling multiple directories or losing context between different parts of your codebase, **Agent Context** creates a focused workspace with symlinked folders that maintain your original file structure while providing a unified view.

Perfect for:
- 🤖 **AI pair programming** sessions
- 🔄 **Multi-repository workflows** 
- 📁 **Monorepo navigation**
- 🎯 **Focused development** sessions
- 🧠 **Context switching** between projects

## Features

- 🔗 **Smart Symlinking**: Creates organized workspaces without duplicating files
- 🖥️ **Interactive Terminal UI**: Beautiful React Ink-powered interface for folder selection
- ⚡ **Quick Setup**: Two modes - auto-generated timestamped workspaces or custom directories
- 🎯 **Selective Inclusion**: Choose exactly which folders to include in your workspace
- 🚀 **Zero Configuration**: Works out of the box with any project structure
- 🔄 **Non-Destructive**: Original files remain untouched, only creates symlinks
- 📂 **Flexible Workspace**: Perfect for AI agents, IDEs, and development tools

## Installation

### Quick Start with npx

Get started instantly without installing:

```bash
npx agent-context
```

### Global Installation

Install globally for repeated use:

```bash
npm install -g agent-context
```

## Usage

### Interactive Mode

Simply run the command in your project directory:

```bash
agent-context
```

You'll be guided through:

1. **Mode Selection**: Choose between auto-generated workspace or custom directory
2. **Folder Selection**: Interactive browser to select which folders to symlink
3. **Workspace Creation**: Automatic symlinking into your chosen workspace directory

#### Auto Mode
Creates a timestamped workspace under `~/coder-work/session-YYYYMMDD-HHMM` - perfect for quick AI coding sessions.

#### Manual Mode  
Lets you choose a custom target directory for more permanent workspace setups.

### Keyboard Controls

- **↑/↓**: Navigate through folders
- **←/→**: Collapse/expand directories  
- **Space/Enter**: Select/deselect folders
- **Esc/q**: Exit the application

## Use Cases

- **🤖 AI Coding Sessions**: Create focused workspaces for:
  - **Claude Code** - AI pair programming with Anthropic's assistant
  - **Cursor** - AI-first code editor with inline completions  
  - **Windsurf** - Agentic AI coding with Cascade interface
  - **GitHub Copilot** - Microsoft's AI pair programmer
  - **Qwen Coder** - Alibaba's open-source coding model
  - **CodeGPT** - Multi-model AI coding platform
  - **Tabnine** - Privacy-focused AI assistant with local models
  - **Aider** - AI pair programming in terminal
- **🔄 Multi-Repo Development**: Work across multiple repositories in a single context
- **📚 Learning & Exploration**: Organize code samples and tutorials for study
- **🎯 Feature Development**: Isolate specific components and dependencies
- **👥 Team Collaboration**: Share workspace configurations for consistent development environments
- **🧠 Context Management**: Reduce cognitive load by organizing related project files

## Workflow Examples

### AI Pair Programming Session with Claude Code
```bash
# Quick setup for Claude Code session
npx agent-context
# Select relevant folders, creates ~/coder-work/session-20250306-1430
# Open workspace in Claude Code for focused AI assistance
```

### Cursor AI-First Development
```bash
# Create organized workspace for Cursor
agent-context
# Choose manual mode, select ~/workspaces/my-project
# Select project folders for Cursor's inline AI completions
# Benefit from better context understanding
```

### Windsurf Agentic Coding
```bash
# Prepare workspace for Windsurf's Cascade AI
npx agent-context
# Select related codebases and dependencies
# Let Windsurf's AI agent work across multiple files with full context
```

### Multi-Repository Feature Work with GitHub Copilot
```bash
# Create custom workspace for cross-repo feature
agent-context
# Choose manual mode, select ~/workspaces/user-auth-feature  
# Select folders from multiple repositories
# Enhanced Copilot suggestions with organized context
```

### Terminal AI Pairing with Aider
```bash
# Create workspace for terminal-based AI coding
agent-context
# Choose manual mode, select ~/workspaces/feature-branch
# Select relevant project files
# Use Aider for AI-assisted coding directly in terminal
```

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or feature requests:

- 📝 Open an [issue](https://github.com/nt9142/agent-context/issues)
- 🔧 Submit a pull request
- 💬 Join the [discussions](https://github.com/nt9142/agent-context/discussions)

## License

This project is licensed under the [MIT License](LICENSE).

## Support

If you find Agent Context helpful:

- ⭐ **Star this repository** on [GitHub](https://github.com/nt9142/agent-context)
- 🗣 **Share with colleagues** working with AI coding tools  
- 💬 **Provide feedback** and feature suggestions
- 🤝 **Contribute** to make it better for everyone

---

**Keywords**: AI coding assistant, LLM workspace, symlink manager, development tools, Claude Code, Cursor, Windsurf, GitHub Copilot, Qwen Coder, CodeGPT, Tabnine, Aider, StarCoder, CodeT5, AI pair programming, agentic AI, local development, monorepo tools, multi-repository, context switching, developer productivity, workspace management, CLI tools.
