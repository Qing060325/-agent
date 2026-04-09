import * as fs from 'fs/promises';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Backup and Restore Manager
 */
export class BackupRestoreManager {
  private backupDir: string;

  constructor(backupDir: string = '.manus/backups') {
    this.backupDir = backupDir;
  }

  /**
   * Initialize backup manager
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create backup directory: ${error}`);
    }
  }

  /**
   * Create backup
   */
  async createBackup(data: any, name?: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = name || `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.json.gz`);

      const jsonData = JSON.stringify(data, null, 2);
      const compressed = await gzip(jsonData);

      await fs.writeFile(backupPath, compressed);

      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Restore backup
   */
  async restoreBackup(backupPath: string): Promise<any> {
    try {
      const compressed = await fs.readFile(backupPath);
      const decompressed = await gunzip(compressed);
      const data = JSON.parse(decompressed.toString('utf-8'));

      return data;
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }

  /**
   * List backups
   */
  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      return files
        .filter((f) => f.endsWith('.json.gz'))
        .sort()
        .reverse();
    } catch (error) {
      console.error(`Failed to list backups: ${error}`);
      return [];
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupName: string): Promise<void> {
    try {
      const backupPath = path.join(this.backupDir, backupName);
      await fs.unlink(backupPath);
    } catch (error) {
      console.error(`Failed to delete backup: ${error}`);
    }
  }

  /**
   * Get backup info
   */
  async getBackupInfo(backupName: string): Promise<any> {
    try {
      const backupPath = path.join(this.backupDir, backupName);
      const stat = await fs.stat(backupPath);

      return {
        name: backupName,
        path: backupPath,
        size: stat.size,
        created: stat.birthtime,
        modified: stat.mtime,
      };
    } catch (error) {
      console.error(`Failed to get backup info: ${error}`);
      return null;
    }
  }

  /**
   * Auto backup
   */
  async autoBackup(data: any, maxBackups: number = 10): Promise<string> {
    const backupPath = await this.createBackup(data);

    // Clean old backups
    const backups = await this.listBackups();
    if (backups.length > maxBackups) {
      for (let i = maxBackups; i < backups.length; i++) {
        await this.deleteBackup(backups[i]);
      }
    }

    return backupPath;
  }

  /**
   * Get backup statistics
   */
  async getStats(): Promise<any> {
    try {
      const backups = await this.listBackups();
      let totalSize = 0;

      for (const backup of backups) {
        const info = await this.getBackupInfo(backup);
        if (info) {
          totalSize += info.size;
        }
      }

      return {
        totalBackups: backups.length,
        totalSize,
        backups,
      };
    } catch (error) {
      console.error(`Failed to get backup stats: ${error}`);
      return { totalBackups: 0, totalSize: 0, backups: [] };
    }
  }
}

/**
 * Global backup manager instance
 */
export const globalBackupManager = new BackupRestoreManager();
