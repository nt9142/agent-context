import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import chalk from "chalk";
import path from "path";
import * as fs from "fs/promises";
import os from "os";

const expandTilde = (p: string | undefined): string | undefined =>
  p && p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;

async function getDirContents(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((name) => !name.startsWith("."))
      .sort();
    return dirs;
  } catch (err) {
    return [];
  }
}

export type DirectoryBrowserMode = "target" | "projects";

export interface DirectoryBrowserResult {
  target: string | null;
  projects: string[];
}

export interface DirectoryBrowserProps {
  onComplete: (result: DirectoryBrowserResult) => void;
  initialPath?: string;
  mode?: DirectoryBrowserMode; // default: "target"
}

export default function DirectoryBrowser({
  onComplete,
  initialPath,
  mode = "target",
}: DirectoryBrowserProps) {
  const { stdout } = useStdout();
  const terminalHeight: number = (stdout as any)?.rows || 24;
  const [currentPath, setCurrentPath] = useState<string>(() =>
    path.resolve(expandTilde(initialPath || process.cwd())!)
  );
  const [dirs, setDirs] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [filter, setFilter] = useState<string>("");

  // Calculate visible items based on terminal height
  // Reserve lines for header, current path, controls, selected display
  const reservedLines = mode === "projects" ? 12 : 10; // Less space needed now
  const maxVisibleItems = Math.max(5, terminalHeight - reservedLines - 1); // -1 to prevent scrolling

  useEffect(() => {
    const loadDirs = async () => {
      setLoading(true);
      setError(null);
      try {
        const contents = await getDirContents(currentPath);
        setDirs(contents);
        setSelectedIndex(0);
        setScrollOffset(0);
        setFilter(""); // Clear filter when changing directories
      } catch (err: any) {
        setError(err?.message ?? String(err));
        setDirs([]);
      } finally {
        setLoading(false);
      }
    };
    loadDirs();
  }, [currentPath]);

  // Filter directories based on typed filter
  const filteredDirs = dirs.filter(dir => 
    dir.toLowerCase().includes(filter.toLowerCase())
  );

  // Reset selection when filter changes
  useEffect(() => {
    if (filter) {
      setSelectedIndex(0);
      setScrollOffset(0);
    }
  }, [filter]);

  // Adjust scroll when selection moves
  useEffect(() => {
    if (selectedIndex < scrollOffset) {
      setScrollOffset(selectedIndex);
    } else if (selectedIndex >= scrollOffset + maxVisibleItems) {
      setScrollOffset(selectedIndex - maxVisibleItems + 1);
    }
  }, [selectedIndex, scrollOffset, maxVisibleItems]);

  useInput((input, key) => {
    if (loading) return;

    // Handle backspace to remove characters from filter
    if (key.backspace || key.delete || input === '\x08' || input === '\x7f') {
      setFilter((prev: string) => prev.slice(0, -1));
      return;
    }

    // Handle regular character input for filtering
    if (input && input.length === 1 && /^[a-zA-Z0-9\-_.]$/.test(input)) {
      setFilter((prev: string) => prev + input);
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev: number) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev: number) => Math.min(filteredDirs.length - 1, prev + 1));
    } else if (key.leftArrow) {
      // Go up/outside to parent directory
      const parent = path.dirname(currentPath);
      if (parent !== currentPath) {
        setCurrentPath(parent);
      }
    } else if (key.rightArrow) {
      // Go down/inside selected directory
      if (filteredDirs.length > 0 && selectedIndex < filteredDirs.length) {
        const selectedDir = filteredDirs[selectedIndex];
        setCurrentPath(path.join(currentPath, selectedDir));
      }
    } else if (input === " ") {
      if (mode === "target") {
        // In target mode, space confirms the current directory
        onComplete({ target: currentPath, projects: [] });
      } else {
        // In projects mode, toggle selection of the folder the arrow points to
        if (filteredDirs.length > 0 && selectedIndex < filteredDirs.length) {
          const selectedDir = filteredDirs[selectedIndex];
          const fullPath = path.join(currentPath, selectedDir);
          setSelectedPaths((prev: Set<string>) => {
            const next = new Set(prev);
            if (next.has(fullPath)) {
              next.delete(fullPath);
            } else {
              next.add(fullPath);
            }
            return next;
          });
        }
      }
    } else if (key.return) {
      if (mode === "target") {
        onComplete({ target: currentPath, projects: [] });
      } else {
        // If no folders selected, select the currently pointed folder
        if (selectedPaths.size === 0 && filteredDirs.length > 0 && selectedIndex < filteredDirs.length) {
          const selectedDir = filteredDirs[selectedIndex];
          const fullPath = path.join(currentPath, selectedDir);
          onComplete({ target: null, projects: [fullPath] });
        } else {
          onComplete({ target: null, projects: Array.from(selectedPaths) });
        }
      }
    } else if (key.escape || input === "q") {
      process.exit(0);
    }
  });

  const parentDir = path.dirname(currentPath);
  const isRoot = parentDir === currentPath;

  // Get visible directories based on scroll (using filtered dirs)
  const visibleDirs = filteredDirs.slice(scrollOffset, scrollOffset + maxVisibleItems);
  const hasMoreAbove = scrollOffset > 0;
  const hasMoreBelow = scrollOffset + maxVisibleItems < filteredDirs.length;

  return (
    <Box flexDirection="column" height={terminalHeight - 1}>
      <Box flexDirection="column" flexGrow={1}>
        <Box borderStyle="round" paddingX={1} marginBottom={1}>
          <Text bold>
            {mode === "target"
              ? chalk.cyan("Select Target Directory for Symlinks")
              : chalk.cyan("Select Project Directories to Symlink")}
          </Text>
        </Box>

        <Box paddingX={1} marginBottom={1}>
          <Text>
            {chalk.bold("📁")} {currentPath}
          </Text>
        </Box>

        {/* Filter display */}
        <Box paddingX={1} marginBottom={1}>
          <Text>
            {chalk.bold("🔍")} Filter: {filter || chalk.gray("(type to filter)")}
            {filter && <Text dimColor> ({filteredDirs.length} of {dirs.length} shown)</Text>}
          </Text>
        </Box>

        {/* Reserved space for selected items in projects mode */}
        {mode === "projects" && (
          <Box paddingX={1} marginBottom={1}>
            {selectedPaths.size > 0 ? (
              <Box flexDirection="column">
                <Text dimColor>Selected ({selectedPaths.size}):</Text>
                <Text>
                  {([...selectedPaths] as string[]).map((p) => path.basename(p)).join(", ")}
                </Text>
              </Box>
            ) : (
              <Text dimColor>No directories selected yet</Text>
            )}
          </Box>
        )}

        <Box flexDirection="column" paddingX={1} flexGrow={1}>
          {!isRoot && (
            <Text dimColor>
              {chalk.gray("←")} .. {chalk.gray("(parent)")}
            </Text>
          )}

          {loading ? (
            <Text>Loading...</Text>
          ) : error ? (
            <Text color="red">Error: {error}</Text>
          ) : dirs.length === 0 ? (
            <Text dimColor>No subdirectories</Text>
          ) : filteredDirs.length === 0 ? (
            <Text dimColor>No directories match filter "{filter}"</Text>
          ) : (
            <>
              {hasMoreAbove && <Text dimColor>{chalk.gray("↑ more...")}</Text>}
              {visibleDirs.map((dir: string, visibleIndex: number) => {
                const actualIndex = scrollOffset + visibleIndex;
                const fullPath = path.join(currentPath, dir);
                const isSelectedFolder = selectedPaths.has(fullPath);

                return (
                  <React.Fragment key={dir}>
                    <Text>
                      {actualIndex === selectedIndex
                        ? (
                          <>
                            {isSelectedFolder ? chalk.green("✓") : " "} {chalk.cyan("→ " + dir)}
                          </>
                        )
                        : (
                          <>
                            {isSelectedFolder ? chalk.green("✓") : " "}   {dir}
                          </>
                        )
                      }
                    </Text>
                  </React.Fragment>
                );
              })}
              {hasMoreBelow && <Text dimColor>{chalk.gray("↓ more...")}</Text>}
            </>
          )}
        </Box>
      </Box>

      <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="column">
        <Text>
          {chalk.bold("Navigation:")} {chalk.gray("↑↓")} Select • {chalk.gray("←")} Parent • {chalk.gray("→")} Enter
        </Text>
        <Text>
          {chalk.bold("Filter:")} {chalk.gray("Type")} to filter • {chalk.gray("Backspace")} Remove chars
        </Text>
        <Text>
          {mode === "target" ? (
            <>
              {chalk.bold("Actions:")} {chalk.gray("Space/Enter")} Confirm • {chalk.gray("Esc")} Exit
            </>
          ) : (
            <>
              {chalk.bold("Actions:")} {chalk.gray("Space")} Toggle • {chalk.gray("Enter")} Done • {chalk.gray("Esc")} Exit
            </>
          )}
        </Text>
      </Box>
    </Box>
  );
}
