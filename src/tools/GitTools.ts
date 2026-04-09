import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { BaseTool, ValidationError } from './Tool.js';
import { z } from 'zod';
import type { ToolContext, ToolResult } from '../types/index.js';

const GitStatusSchema = z.object({
  path: z.string().optional(),
});

const GitDiffSchema = z.object({
  path: z.string().optional(),
  staged: z.boolean().optional().default(false),
  commit: z.string().optional(),
});

const GitLogSchema = z.object({
  path: z.string().optional(),
  limit: z.number().optional().default(10),
  oneline: z.boolean().optional().default(false),
});

const GitBranchSchema = z.object({
  path: z.string().optional(),
});

/**
 * Git Status Tool - Get repository status
 */
export class GitStatusTool extends BaseTool {
  name = 'git-status';
  description = 'Get git repository status (branch, modified files, staged files)';
  inputSchema = GitStatusSchema;
  permissions = [{ check: () => true }];

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: repoPath } = GitStatusSchema.parse(input);
    const cwd = repoPath || process.cwd();

    try {
      if (!this.isGitRepo(cwd)) {
        return {
          success: false,
          error: `${cwd} is not a git repository`,
          timestamp: Date.now(),
        };
      }

      const branch = this.exec('git rev-parse --abbrev-ref HEAD', cwd);
      const remoteUrl = this.safeExec('git remote get-url origin', cwd);
      const status = this.exec('git status --porcelain', cwd);
      const aheadBehind = this.safeExec('git rev-list --left-right --count HEAD...@{upstream}', cwd);

      const modified: string[] = [];
      const staged: string[] = [];
      const untracked: string[] = [];

      for (const line of status.split('\n').filter(Boolean)) {
        const statusCode = line.substring(0, 2);
        const filePath = line.substring(3);

        if (statusCode[0] !== ' ' && statusCode[0] !== '?') staged.push(filePath);
        if (statusCode[1] !== ' ' && statusCode[1] !== '?') modified.push(filePath);
        if (statusCode === '??') untracked.push(filePath);
      }

      return {
        success: true,
        result: {
          branch,
          remoteUrl: remoteUrl || null,
          staged,
          modified,
          untracked,
          aheadBehind: aheadBehind || null,
          isClean: status.trim().length === 0,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return { success: false, error: error.message, timestamp: Date.now() };
    }
  }
}

/**
 * Git Diff Tool - Get diff of changes
 */
export class GitDiffTool extends BaseTool {
  name = 'git-diff';
  description = 'Get git diff for changes (staged or unstaged)';
  inputSchema = GitDiffSchema;
  permissions = [{ check: () => true }];

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: repoPath, staged, commit } = GitDiffSchema.parse(input);
    const cwd = repoPath || process.cwd();

    try {
      let cmd = 'git diff';
      if (commit) cmd = `git diff ${commit}`;
      else if (staged) cmd = 'git diff --staged';

      cmd += ' --stat';
      const diffStat = this.safeExec(cmd, cwd);

      cmd = cmd.replace(' --stat', '');
      const diff = this.safeExec(cmd + ' | head -500', cwd);

      return {
        success: true,
        result: {
          stat: diffStat,
          diff: diff || '(no changes)',
          staged,
          commit,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return { success: false, error: error.message, timestamp: Date.now() };
    }
  }
}

/**
 * Git Log Tool - Get commit history
 */
export class GitLogTool extends BaseTool {
  name = 'git-log';
  description = 'Get git commit history';
  inputSchema = GitLogSchema;
  permissions = [{ check: () => true }];

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: repoPath, limit, oneline } = GitLogSchema.parse(input);
    const cwd = repoPath || process.cwd();

    try {
      const format = oneline
        ? `--oneline`
        : `--pretty=format:"%h|%an|%ar|%s"`;
      const log = this.exec(`git log ${format} -n ${limit}`, cwd);

      if (oneline) {
        return {
          success: true,
          result: { commits: log.split('\n').filter(Boolean) },
          timestamp: Date.now(),
        };
      }

      const commits = log
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, author, date, ...messageParts] = line.split('|');
          return { hash, author, date, message: messageParts.join('|') };
        });

      return {
        success: true,
        result: { commits },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return { success: false, error: error.message, timestamp: Date.now() };
    }
  }
}

/**
 * Git Branch Tool - List branches
 */
export class GitBranchTool extends BaseTool {
  name = 'git-branch';
  description = 'List git branches (local and remote)';
  inputSchema = GitBranchSchema;
  permissions = [{ check: () => true }];

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: repoPath } = GitBranchSchema.parse(input);
    const cwd = repoPath || process.cwd();

    try {
      const local = this.exec('git branch', cwd)
        .split('\n')
        .filter(Boolean)
        .map((b) => b.trim().replace('* ', ''));

      const remote = this.safeExec('git branch -r', cwd)
        .split('\n')
        .filter(Boolean)
        .map((b) => b.trim());

      const current = this.exec('git rev-parse --abbrev-ref HEAD', cwd);

      return {
        success: true,
        result: { current, local, remote },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return { success: false, error: error.message, timestamp: Date.now() };
    }
  }
}

/**
 * Git Context Tool - Get full repo context for AI consumption
 */
export class GitContextTool extends BaseTool {
  name = 'git-context';
  description = 'Get comprehensive git repository context (branch, status, recent commits, changed files)';
  inputSchema = z.object({ path: z.string().optional() });
  permissions = [{ check: () => true }];

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: repoPath } = z.object({ path: z.string().optional() }).parse(input);
    const cwd = repoPath || process.cwd();

    try {
      if (!this.isGitRepo(cwd)) {
        return {
          success: false,
          error: `${cwd} is not a git repository`,
          timestamp: Date.now(),
        };
      }

      const branch = this.exec('git rev-parse --abbrev-ref HEAD', cwd);
      const remoteUrl = this.safeExec('git remote get-url origin', cwd);
      const lastCommit = this.exec('git log -1 --pretty=format:"%h %s (%ar)"', cwd);
      const status = this.exec('git status --porcelain', cwd);
      const log = this.exec('git log --oneline -5', cwd);
      const contributors = this.exec(
        'git shortlog -sn --no-merges | head -5',
        cwd
      );
      const fileCount = this.exec(
        'git ls-files | wc -l',
        cwd
      );

      return {
        success: true,
        result: {
          branch,
          remoteUrl: remoteUrl || null,
          lastCommit,
          status: status || '(clean)',
          recentCommits: log.split('\n').filter(Boolean),
          topContributors: contributors.split('\n').filter(Boolean),
          trackedFiles: parseInt(fileCount.trim()) || 0,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return { success: false, error: error.message, timestamp: Date.now() };
    }
  }
}

// Shared helpers
function isGitRepo(dir: string): boolean {
  return fs.existsSync(path.join(dir, '.git'));
}

// Mix helpers into prototypes
(BaseTool.prototype as any).isGitRepo = isGitRepo;
(BaseTool.prototype as any).exec = (cmd: string, cwd: string) =>
  execSync(cmd, { cwd, encoding: 'utf-8' }).trim();
(BaseTool.prototype as any).safeExec = (cmd: string, cwd: string) => {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
};

export const GIT_TOOLS = [
  new GitStatusTool(),
  new GitDiffTool(),
  new GitLogTool(),
  new GitBranchTool(),
  new GitContextTool(),
];
