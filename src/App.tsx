import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import chalk from "chalk";
import path from "path";
import * as fs from "fs/promises";
import DirectoryBrowser, { DirectoryBrowserResult } from "./DirectoryBrowser.tsx";
import { ensureDir, uniqueName, computeAutoTarget, formatDate } from "./utils.ts";

// helpers moved to utils.ts for readability

type Mode = "auto" | "manual" | null;

interface CreateResultOk {
  src: string;
  dest: string;
  ok: true;
  msg: string;
}

interface CreateResultErr {
  src: string;
  dest: null;
  ok: false;
  msg: string;
}

type CreateResult = CreateResultOk | CreateResultErr;

export default function App({
  allowChoice = false,
  forceManual = false,
}: {
  allowChoice?: boolean;
  forceManual?: boolean;
}) {
  const { exit } = useApp();
  const [step, setStep] = useState<
    "mode-select" | "select-target" | "select-projects" | "creating" | "done"
  >("mode-select");
  const [mode, setMode] = useState<Mode>(null); // "auto" or "manual"
  const [selectedMode, setSelectedMode] = useState<number>(0); // 0 = auto, 1 = manual
  const [target, setTarget] = useState<string | null>(null);
  const [projects, setProjects] = useState<string[]>([]);

  const [creating, setCreating] = useState<boolean>(false);
  const [progressIdx, setProgressIdx] = useState<number>(0);
  const [created, setCreated] = useState<CreateResult[]>([]);
  const [fallbackMsg, setFallbackMsg] = useState<string | null>(null);

  // computeAutoTarget moved to utils.ts

  // Initial mode selection based on CLI flags
  useEffect(() => {
    (async () => {
      if (forceManual) {
        setMode("manual");
        setStep("select-target");
        return;
      }
      if (!allowChoice) {
        // Default to auto. Check permissions and fallback to manual if needed.
        const { tempPath } = computeAutoTarget();
        try {
          await ensureDir(tempPath);
          setMode("auto");
          setTarget(tempPath);
          setStep("select-projects");
        } catch (e: any) {
          setFallbackMsg(
            `No write permissions for ${tempPath}. Falling back to manual mode. (Reason: ${e?.message ?? "unknown"})`
          );
          setMode("manual");
          setStep("select-target");
        }
      }
    })();
  }, [allowChoice, forceManual]);

  // For auto mode, output path when done - must be before any conditionals
  useEffect(() => {
    if (step === "done" && mode === "auto" && target) {
      // Output the path so user can easily copy it
      console.log("\n" + chalk.bold.green("✨ Workspace created successfully!"));
      console.log(chalk.bold("\nPath to use:"));
      console.log(chalk.cyan.bold(target));
      console.log(chalk.gray("\n(Copy the path above)"));
    }
  }, [step, mode, target]);

  useInput((input, key: any) => {
    if (step === "mode-select") {
      if (key.upArrow || key.downArrow) {
        setSelectedMode((prev: number) => (prev === 0 ? 1 : 0));
      } else if (key.return) {
        if (selectedMode === 0) {
          // Auto
          (async () => {
            const { tempPath } = computeAutoTarget();
            try {
              await ensureDir(tempPath);
              setMode("auto");
              setTarget(tempPath);
              setStep("select-projects");
            } catch (e: any) {
              setFallbackMsg(
                `No write permissions for ${tempPath}. Falling back to manual mode. (Reason: ${e?.message ?? "unknown"})`
              );
              setMode("manual");
              setStep("select-target");
            }
          })();
        } else {
          setMode("manual");
          setStep("select-target");
        }
      } else if ((key.escape as boolean) || input === "q") {
        exit();
      }
    }
  });

  // Step 0: Mode selection
  if (step === "mode-select") {
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="round" paddingX={1} marginBottom={1}>
          <Text bold>{chalk.cyan("Agent Context - Quick Workspace Setup")}</Text>
        </Box>

        <Box flexDirection="column" marginBottom={1}>
          <Text>How would you like to create your workspace?</Text>
          <Text> </Text>
          <Text>
            {selectedMode === 0 ? chalk.cyan("→") : " "} {chalk.bold(chalk.green("Auto"))} - Create temporary workspace
          </Text>
          <Text dimColor>    Quick setup in ~/agent-context/session-{formatDate()}</Text>
          <Text> </Text>
          <Text>
            {selectedMode === 1 ? chalk.cyan("→") : " "} {chalk.bold(chalk.blue("Manual"))} - Choose target directory
          </Text>
          <Text dimColor>    Select where to create symlinks</Text>
        </Box>

        <Box borderStyle="single" borderColor="gray" paddingX={1}>
          <Text>{chalk.gray("↑↓")} Navigate • {chalk.gray("Enter")} Select • {chalk.gray("Esc")} Exit</Text>
        </Box>
      </Box>
    );
  }

  // Step 1: Select target directory (manual mode only)
  if (step === "select-target") {
    return (
      <Box flexDirection="column" padding={1}>
        {fallbackMsg && (
          <Box marginBottom={1}>
            <Text color="yellow">{fallbackMsg}</Text>
          </Box>
        )}
        <DirectoryBrowser
          mode="target"
          initialPath={process.cwd()}
          onComplete={async ({ target: selectedTarget }: DirectoryBrowserResult) => {
            try {
              await ensureDir(selectedTarget!);
              setTarget(selectedTarget!);
              setStep("select-projects");
            } catch (e: any) {
              console.error(`Failed to ensure target: ${e.message}`);
              process.exit(1);
            }
          }}
        />
      </Box>
    );
  }

  // Step 2: Select project directories
  if (step === "select-projects") {
    return (
      <DirectoryBrowser
        mode="projects"
        initialPath={process.cwd()}
        onComplete={({ projects: selectedProjects }: DirectoryBrowserResult) => {
          if (selectedProjects.length === 0) {
            console.log(chalk.yellow("No projects selected. Exiting."));
            process.exit(0);
            return;
          }
          setProjects(selectedProjects);
          setStep("creating");

          // Start creating symlinks immediately
          void createSymlinks(selectedProjects);
        }}
      />
    );
  }

  // Step 3: Creating symlinks
  if (step === "creating" || creating) {
    const currentProject = projects[progressIdx];
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>{chalk.cyan("Creating Symlinks")}</Text>
        <Box marginTop={1}>
          <Text>
            <Spinner type="dots" /> Creating symlinks in {chalk.bold(target ?? "")}
          </Text>
        </Box>
        {currentProject && (
          <Box marginTop={1}>
            <Text>Processing: {chalk.yellow(path.basename(currentProject))}</Text>
          </Box>
        )}
        <Box marginTop={1} flexDirection="column">
          {projects.slice(0, progressIdx).map((proj: string, i: number) => (
            <React.Fragment key={i}>
              <Text>{`✅ ${chalk.green(path.basename(proj))}`}</Text>
            </React.Fragment>
          ))}
        </Box>
      </Box>
    );
  }

  // Step 4: Done
  if (step === "done") {
    const ok = created.filter((r: CreateResult) => r.ok) as CreateResultOk[];
    const fail = created.filter((r: CreateResult) => !r.ok) as CreateResultErr[];

    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>{chalk.cyan("Completed")}</Text>

        {ok.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text>{chalk.green.bold("Created symlinks:")}</Text>
            {ok.map((r: CreateResultOk, i: number) => (
              <React.Fragment key={i}>
                <Text>{`✅ ${chalk.green(path.basename(r.src))}`}</Text>
              </React.Fragment>
            ))}
          </Box>
        )}

        {fail.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text>{chalk.red.bold("Failed:")}</Text>
            {fail.map((r: CreateResultErr, i: number) => (
              <React.Fragment key={i}>
                <Text>{`❌ ${chalk.red(path.basename(r.src))} — ${r.msg}`}</Text>
              </React.Fragment>
            ))}
          </Box>
        )}

        <Box marginTop={1} borderStyle="double" borderColor="green" paddingX={1} flexDirection="column">
          <Text bold>📁 Workspace ready at:</Text>
          <Text>{chalk.cyan.bold(target ?? "")}</Text>
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text dimColor>Next: {chalk.bold(`cd ${target ?? ""}`)}</Text>
        </Box>
      </Box>
    );
  }

  // Helper function to create symlinks
  async function createSymlinks(projectPaths: string[]) {
    setCreating(true);
    const results: CreateResult[] = [];

    // Ensure target directory exists (especially for auto mode)
    try {
      await ensureDir(target!);
    } catch (e: any) {
      console.error(`Failed to create target directory: ${e.message}`);
      process.exit(1);
      return;
    }

    for (let i = 0; i < projectPaths.length; i++) {
      const src = projectPaths[i];
      const name = path.basename(src);
      setProgressIdx(i);

      try {
        const finalName = await uniqueName(target!, name);
        const dest = path.join(target!, finalName);

        // If path exists and is file/symlink, unlink; if directory, error
        try {
          const st = await fs.lstat(dest);
          if (st.isSymbolicLink() || st.isFile()) {
            await fs.unlink(dest);
          } else if (st.isDirectory()) {
            throw new Error(`Destination exists and is a directory: ${dest}`);
          }
        } catch {
          // no-op if lstat failed (doesn't exist)
        }

        const type = (process.platform === "win32" ? "junction" : "dir") as "dir" | "junction";
        await fs.symlink(src, dest, type);
        results.push({ src, dest, ok: true, msg: "ok" });
      } catch (e: any) {
        results.push({ src, dest: null, ok: false, msg: e.message });
      }
    }

    setCreated(results);
    setCreating(false);
    setStep("done");

    // Auto-exit after a short delay
    setTimeout(() => process.exit(0), 3000);
  }

  return <Text>Loading...</Text>;
}
