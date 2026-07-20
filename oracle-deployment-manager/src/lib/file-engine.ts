import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import type { FileItem } from '@/types';

export interface DriveInfo {
  letter: string;
  label: string;
  freeSpace: number;
  totalSpace: number;
}

export class FileEngine {
  static async listDrives(): Promise<string[]> {
    if (process.platform === 'win32') {
      const { execSync } = await import('child_process');
      try {
        const output = execSync(
          'powershell -Command "Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name"',
          { encoding: 'utf-8' }
        );
        return output
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => /^[A-Z]$/.test(l))
          .map((l: string) => l + ':');
      } catch {
        return ['C:'];
      }
    }
    return ['/'];
  }

  static async listDrivesInfo(): Promise<DriveInfo[]> {
    if (process.platform === 'win32') {
      const { execSync } = await import('child_process');
      try {
        const output = execSync(
          'powershell -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N=\'Label\';E={$_.Root}}, @{N=\'FreeSpace\';E={if($_.Free -ge 0){$_.Free}else{0}}}, @{N=\'TotalSpace\';E={if($_.Used -ge 0 -and $_.Free -ge 0){$_.Used + $_.Free}else{0}}} | ConvertTo-Json"',
          { encoding: 'utf-8' }
        );
        const drives = JSON.parse(output);
        const arr = Array.isArray(drives) ? drives : [drives];
        return arr.map((d: any) => ({
          letter: d.Name + ':',
          label: d.Label || d.Name + ':',
          freeSpace: d.FreeSpace || 0,
          totalSpace: d.TotalSpace || 0,
        }));
      } catch {
        return [{ letter: 'C:', label: 'Local Disk', freeSpace: 0, totalSpace: 0 }];
      }
    }
    const letters = await this.listDrives();
    return letters.map((l) => ({ letter: l, label: l, freeSpace: 0, totalSpace: 0 }));
  }

  static async listDirectory(dirPath: string): Promise<FileItem[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const items: FileItem[] = [];
      for (const entry of entries) {
        try {
          const fullPath = path.join(dirPath, entry.name);
          const stat = await fs.stat(fullPath);
          items.push({
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: stat.size,
            modified: stat.mtime.toISOString(),
            extension: entry.isDirectory() ? '' : path.extname(entry.name).toLowerCase(),
          });
        } catch {
          items.push({
            name: entry.name,
            path: path.join(dirPath, entry.name),
            type: entry.isDirectory() ? 'directory' : 'file',
            size: 0,
            modified: new Date().toISOString(),
            extension: '',
          });
        }
      }
      return items.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
    } catch (error) {
      throw new Error(`Cannot access directory: ${dirPath}`);
    }
  }

  static async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async createDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  static async deleteItem(itemPath: string): Promise<void> {
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      await fs.rm(itemPath, { recursive: true, force: true });
    } else {
      await fs.unlink(itemPath);
    }
  }

  static async renameItem(oldPath: string, newName: string): Promise<string> {
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    await fs.rename(oldPath, newPath);
    return newPath;
  }

  static async copyItem(src: string, dest: string): Promise<void> {
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src);
      for (const entry of entries) {
        await this.copyItem(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      await fs.copyFile(src, dest);
    }
  }

  static async moveItem(src: string, dest: string): Promise<void> {
    await fs.rename(src, dest);
  }

  static async backupFile(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(dir, `${name}_backup_${timestamp}${ext}`);
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }

  static async restoreFile(backupPath: string, originalPath: string): Promise<void> {
    await fs.copyFile(backupPath, originalPath);
  }

  static async replaceInFile(filePath: string, search: string, replace: string): Promise<void> {
    let content = await fs.readFile(filePath, 'utf-8');
    content = content.split(search).join(replace);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async searchInFile(filePath: string, query: string): Promise<number[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const matches: number[] = [];
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        matches.push(index + 1);
      }
    });
    return matches;
  }

  static async compareFiles(file1: string, file2: string): Promise<{ line: number; file1: string; file2: string }[]> {
    const [content1, content2] = await Promise.all([
      fs.readFile(file1, 'utf-8'),
      fs.readFile(file2, 'utf-8'),
    ]);
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    const diffs: { line: number; file1: string; file2: string }[] = [];
    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      if (lines1[i] !== lines2[i]) {
        diffs.push({
          line: i + 1,
          file1: lines1[i] || '<missing>',
          file2: lines2[i] || '<missing>',
        });
      }
    }
    return diffs;
  }

  static async getDiskSpace(drive: string): Promise<{ total: number; free: number; used: number }> {
    if (process.platform === 'win32') {
      const { execSync } = await import('child_process');
      try {
        const output = execSync(
          `powershell -Command "Get-CimInstance Win32_LogicalDisk -Filter \\\"DeviceID='${drive}'\\\" | Select-Object @{N='Size';E={$_.Size}},@{N='FreeSpace';E={$_.FreeSpace}} | ConvertTo-Csv -NoTypeInformation"`,
          { encoding: 'utf-8' }
        );
        const lines = output.trim().split('\n').filter((l: string) => l.trim());
        if (lines.length >= 2) {
          const parts = lines[1].split(',');
          const free = parseInt(parts[1]?.replace(/"/g, '')) || 0;
          const total = parseInt(parts[0]?.replace(/"/g, '')) || 0;
          return { total, free, used: total - free };
        }
      } catch {}
    }
    return { total: 0, free: 0, used: 0 };
  }

  static async getFileSize(filePath: string): Promise<number> {
    const stat = await fs.stat(filePath);
    return stat.size;
  }

  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async searchFiles(dirPath: string, query: string, maxResults: number = 50): Promise<FileItem[]> {
    const results: FileItem[] = [];
    const search = async (dir: string) => {
      if (results.length >= maxResults) return;
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (results.length >= maxResults) return;
          const fullPath = path.join(dir, entry.name);
          if (entry.name.toLowerCase().includes(query.toLowerCase())) {
            try {
              const stat = await fs.stat(fullPath);
              results.push({
                name: entry.name,
                path: fullPath,
                type: entry.isDirectory() ? 'directory' : 'file',
                size: stat.size,
                modified: stat.mtime.toISOString(),
                extension: entry.isDirectory() ? '' : path.extname(entry.name).toLowerCase(),
              });
            } catch {}
          }
          if (entry.isDirectory()) {
            await search(fullPath);
          }
        }
      } catch {}
    };
    await search(dirPath);
    return results;
  }
}
