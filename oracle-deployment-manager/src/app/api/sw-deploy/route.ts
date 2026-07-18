import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FileEngine } from '@/lib/file-engine';
import { IX_MKDIR_PATHS, IX_COPY_OPERATIONS, IX_REN_OPERATIONS, IX_SOURCE_ROOT, IX_MKDIR_BAT } from '@/lib/constants';
import path from 'path';
import fs from 'fs/promises';

type StepResult = {
  dirsCreated: { path: string; success: boolean; error?: string }[];
  filesCopied: { src: string; dest: string; success: boolean; error?: string }[];
  filesRenamed: { path: string; success: boolean; error?: string }[];
  variablesReplaced: { path: string; count: number; success: boolean; error?: string }[];
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, stepId, variables, services, selectedDisk } = body;

  try {
    if (action === 'checkPaths') {
      const result = await checkPaths(selectedDisk || 'D:');
      return NextResponse.json(result);
    }

    if (action === 'executeAll') {
      const result = await executeAll(selectedDisk || 'D:', variables || {}, services);
      try {
        const db = getDb();
        db.prepare(
          'INSERT INTO logs (id, level, message, details, source) VALUES (?, ?, ?, ?, ?)'
        ).run(
          crypto.randomUUID(),
          result.success ? 'success' : 'error',
          `IX Install: ${result.success ? 'completed' : 'failed'}`,
          result.output,
          'IX-Install'
        );
      } catch {}
      return NextResponse.json(result);
    }

    if (action === 'executeStep') {
      const result = await executeStep(stepId, selectedDisk || 'D:', variables || {}, services);
      try {
        const db = getDb();
        db.prepare(
          'INSERT INTO logs (id, level, message, details, source) VALUES (?, ?, ?, ?, ?)'
        ).run(
          crypto.randomUUID(),
          result.success ? 'success' : 'error',
          `IX Install step "${stepId}": ${result.success ? 'completed' : 'failed'}`,
          result.output,
          'IX-Install'
        );
      } catch {}
      return NextResponse.json(result);
    }

    if (action === 'retryFailed') {
      const { failedItems } = body;
      const result = await retryFailed(selectedDisk || 'D:', failedItems || []);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false, output: error.message }, { status: 500 });
  }
}

interface PathCheckResult {
  missingDirs: string[];
  missingSourceFiles: string[];
  existingDirs: string[];
  existingSourceFiles: string[];
  totalSourceFiles: number;
  totalDirs: number;
}

async function checkPaths(disk: string): Promise<PathCheckResult> {
  const missingDirs: string[] = [];
  const missingSourceFiles: string[] = [];
  const existingDirs: string[] = [];
  const existingSourceFiles: string[] = [];

  for (const dir of IX_MKDIR_PATHS) {
    const fullPath = path.join(`${disk}`, dir);
    try {
      const exists = await FileEngine.exists(fullPath);
      if (exists) existingDirs.push(fullPath);
      else missingDirs.push(fullPath);
    } catch {
      missingDirs.push(fullPath);
    }
  }

  for (const op of IX_COPY_OPERATIONS) {
    const srcPath = path.join(IX_SOURCE_ROOT, op.srcFile);
    try {
      const exists = await FileEngine.exists(srcPath);
      if (exists) existingSourceFiles.push(srcPath);
      else missingSourceFiles.push(srcPath);
    } catch {
      missingSourceFiles.push(srcPath);
    }
  }

  return {
    missingDirs,
    missingSourceFiles,
    existingDirs,
    existingSourceFiles,
    totalSourceFiles: IX_COPY_OPERATIONS.length,
    totalDirs: IX_MKDIR_PATHS.length,
  };
}

interface ExecuteResult {
  success: boolean;
  output: string;
  stepTimings: { stepId: string; durationMs: number }[];
  results: StepResult;
  summary: {
    dirsTotal: number;
    dirsOk: number;
    dirsFailed: number;
    filesTotal: number;
    filesOk: number;
    filesFailed: number;
    renamesTotal: number;
    renamesOk: number;
    renamesFailed: number;
  };
}

const ts = () => new Date().toLocaleTimeString();

// ──────────────────────────────────────────────
// Individual step functions
// ──────────────────────────────────────────────

async function stepMkdir(disk: string, results: StepResult, lines: string[]): Promise<void> {
  lines.push(`\n[${ts()}] ── Step 1: Running mkdir_1010.bat ──`);
  try {
    const batContent = await fs.readFile(IX_MKDIR_BAT, 'utf-8');
    const diskMatch = batContent.match(/mkdir\s+([A-Z]):/i);
    const originalDisk = diskMatch ? diskMatch[1] : 'D';
    const newDisk = disk.replace(':', '');
    const modifiedBat = batContent.replace(new RegExp(`mkdir\\s+${originalDisk}:`, 'gi'), `mkdir ${newDisk}:`);

    lines.push(`[${ts()}] Original disk: ${originalDisk}:`);
    lines.push(`[${ts()}] Selected disk: ${newDisk}:`);

    const tempBat = path.join(process.env.TEMP || 'C:\\Windows\\Temp', `ix_mkdir_${Date.now()}.bat`);
    await fs.writeFile(tempBat, modifiedBat, 'utf-8');
    lines.push(`[${ts()}] Temp file: ${tempBat}`);

    const { execSync } = await import('child_process');
    try {
      const output = execSync(`cmd /c "${tempBat}"`, {
        timeout: 60000,
        encoding: 'utf-8',
        windowsHide: true,
      });
      lines.push(`[${ts()}] ✓ mkdir_1010.bat executed successfully`);
      if (output.trim()) {
        output.trim().split('\n').forEach((line: string) => {
          if (line.trim()) lines.push(`[${ts()}]   ${line.trim()}`);
        });
      }
      for (const dir of IX_MKDIR_PATHS) {
        const fullPath = path.join(`${disk}`, dir);
        results.dirsCreated.push({ path: fullPath, success: true });
      }
    } catch (execErr: any) {
      lines.push(`[${ts()}] ✗ Execution error: ${execErr.message}`);
      lines.push(`[${ts()}] Fallback: creating dirs manually...`);
      for (const dir of IX_MKDIR_PATHS) {
        const fullPath = path.join(`${disk}`, dir);
        try {
          await fs.mkdir(fullPath, { recursive: true });
          results.dirsCreated.push({ path: fullPath, success: true });
          lines.push(`[${ts()}] ✓ ${fullPath}`);
        } catch (err: any) {
          results.dirsCreated.push({ path: fullPath, success: false, error: err.message });
          lines.push(`[${ts()}] ✗ ${fullPath} — ${err.message}`);
        }
      }
    }
    try { await fs.unlink(tempBat); } catch {}
  } catch (readErr: any) {
    lines.push(`[${ts()}] ✗ Cannot read mkdir_1010.bat: ${readErr.message}`);
    lines.push(`[${ts()}] Creating dirs manually...`);
    for (const dir of IX_MKDIR_PATHS) {
      const fullPath = path.join(`${disk}`, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
        results.dirsCreated.push({ path: fullPath, success: true });
        lines.push(`[${ts()}] ✓ ${fullPath}`);
      } catch (err: any) {
        results.dirsCreated.push({ path: fullPath, success: false, error: err.message });
        lines.push(`[${ts()}] ✗ ${fullPath} — ${err.message}`);
      }
    }
  }
}

async function stepRename(disk: string, results: StepResult, lines: string[]): Promise<void> {
  lines.push(`\n[${ts()}] ── Step 2: Renaming originals ──`);
  for (const ren of IX_REN_OPERATIONS) {
    const srcPath = path.join(`${disk}`, ren.src);
    const defName = ren.destFile.replace(/(\.[^.]+)$/, '_def$1');
    const destPath = path.join(`${disk}`, ren.destDir, defName);
    try {
      const exists = await FileEngine.exists(srcPath);
      if (exists) {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        const defExists = await FileEngine.exists(destPath);
        if (!defExists) {
          await fs.rename(srcPath, destPath);
        }
        results.filesRenamed.push({ path: srcPath, success: true });
        lines.push(`[${ts()}] ✓ Renamed: ${ren.destFile} → ${defName}`);
      } else {
        results.filesRenamed.push({ path: srcPath, success: true });
        lines.push(`[${ts()}] — Skip (not found): ${srcPath}`);
      }
    } catch (err: any) {
      results.filesRenamed.push({ path: srcPath, success: false, error: err.message });
      lines.push(`[${ts()}] ✗ Rename failed: ${srcPath} — ${err.message}`);
    }
  }
}

async function stepCopy(disk: string, results: StepResult, lines: string[]): Promise<void> {
  lines.push(`\n[${ts()}] ── Step 3: Copying files ──`);
  for (const op of IX_COPY_OPERATIONS) {
    const srcPath = path.join(IX_SOURCE_ROOT, op.srcFile);
    const destDir = path.join(`${disk}`, op.destDir);
    const destPath = path.join(destDir, path.basename(op.srcFile));
    try {
      const srcExists = await FileEngine.exists(srcPath);
      if (!srcExists) {
        results.filesCopied.push({ src: srcPath, dest: destPath, success: false, error: 'Source not found' });
        lines.push(`[${ts()}] ✗ Source missing: ${op.srcFile}`);
        continue;
      }
      await fs.mkdir(destDir, { recursive: true });
      await FileEngine.copyItem(srcPath, destPath);
      results.filesCopied.push({ src: srcPath, dest: destPath, success: true });
      lines.push(`[${ts()}] ✓ ${op.srcFile} → ${destPath}`);
    } catch (err: any) {
      results.filesCopied.push({ src: srcPath, dest: destPath, success: false, error: err.message });
      lines.push(`[${ts()}] ✗ ${op.srcFile} — ${err.message}`);
    }
  }
}

async function stepVariables(disk: string, variables: Record<string, string>, results: StepResult, lines: string[]): Promise<void> {
  lines.push(`\n[${ts()}] ── Step 4: Replacing HOST and SERVICE_NAME ──`);
  lines.push(`[${ts()}] HOST=${variables.HOST || '(none)'}, SERVICE_NAME=${variables.SERVICE_NAME || '(none)'}`);

  const configFiles: { srcFile: string; destPath: string; replacements: { find: string; replace: string }[] }[] = [
    {
      srcFile: 'tnsnames.ora',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'asinst1', 'config', 'tnsnames.ora'),
      replacements: [],
    },
    {
      srcFile: 'formsweb.cfg',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'formsweb.cfg'),
      replacements: variables.HOST ? [{ find: 'DATABASE-LABAN', replace: variables.HOST }] : [],
    },
    {
      srcFile: 'default.env',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'default.env'),
      replacements: variables.HOST ? [
        { find: 'SRVRURL=192.168.0.248', replace: `SRVRURL=${variables.HOST}` },
        { find: 'SRVRURL=172.16.5.100', replace: `SRVRURL=${variables.HOST}` },
      ] : [],
    },
    {
      srcFile: 'ONYXW.env',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'ONYXW.env'),
      replacements: variables.HOST ? [
        { find: 'SRVRURL=192.168.0.248', replace: `SRVRURL=${variables.HOST}` },
        { find: 'SRVRURL=172.16.5.100', replace: `SRVRURL=${variables.HOST}` },
      ] : [],
    },
    {
      srcFile: 'ONYXW_EN.env',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'ONYXW_EN.env'),
      replacements: variables.HOST ? [
        { find: 'SRVRURL=192.168.0.248', replace: `SRVRURL=${variables.HOST}` },
        { find: 'SRVRURL=172.16.5.100', replace: `SRVRURL=${variables.HOST}` },
      ] : [],
    },
    {
      srcFile: 'ONYXWPOS.env',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'ONYXWPOS.env'),
      replacements: variables.HOST ? [
        { find: 'SRVRURL=192.168.0.248', replace: `SRVRURL=${variables.HOST}` },
        { find: 'SRVRURL=172.16.5.100', replace: `SRVRURL=${variables.HOST}` },
      ] : [],
    },
    {
      srcFile: 'ONYXWPOSMN.env',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'ONYXWPOSMN.env'),
      replacements: variables.HOST ? [
        { find: 'SRVRURL=192.168.0.248', replace: `SRVRURL=${variables.HOST}` },
        { find: 'SRVRURL=172.16.5.100', replace: `SRVRURL=${variables.HOST}` },
      ] : [],
    },
    {
      srcFile: 'ONYXWPOSOFF.env',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'ONYXWPOSOFF.env'),
      replacements: variables.HOST ? [
        { find: 'SRVRURL=192.168.0.248', replace: `SRVRURL=${variables.HOST}` },
        { find: 'SRVRURL=172.16.5.100', replace: `SRVRURL=${variables.HOST}` },
      ] : [],
    },
    {
      srcFile: 'rwservlet.properties',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_REPORTS', 'applications', 'reports_11.1.2', 'configuration', 'rwservlet.properties'),
      replacements: variables.HOST ? [
        { find: 'database-laban', replace: variables.HOST.toLowerCase() },
        { find: 'DATABASE-LABAN', replace: variables.HOST },
      ] : [],
    },
    {
      srcFile: 'webutil.cfg',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'asinst1', 'config', 'FormsComponent', 'forms', 'server', 'webutil.cfg'),
      replacements: [],
    },
    {
      srcFile: 'uifont.ali',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'asinst1', 'config', 'FRComponent', 'frcommon', 'tools', 'COMMON', 'uifont.ali'),
      replacements: [],
    },
    {
      srcFile: 'fmrwebar.res',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'as1', 'forms', 'fmrwebar.res'),
      replacements: [],
    },
    {
      srcFile: 'Registry.dat',
      destPath: path.join(`${disk}`, 'oracle', 'ofm', 'ofr', 'user_projects', 'domains', 'ultimate', 'config', 'fmwconfig', 'servers', 'WLS_FORMS', 'applications', 'formsapp_11.1.2', 'config', 'forms', 'registry', 'oracle', 'forms', 'registry', 'registry.dat'),
      replacements: [],
    },
  ];

  for (const cfg of configFiles) {
    try {
      const srcPath = path.join(IX_SOURCE_ROOT, cfg.srcFile);
      const srcContent = await FileEngine.readFile(srcPath);
      let modified = srcContent;
      let count = 0;

      if (cfg.srcFile === 'tnsnames.ora' && (variables.HOST || variables.SERVICE_NAME)) {
        const lines2 = modified.split(/\r?\n/);
        let startIdx = -1;
        let depth = 0;
        let block: string[] = [];
        for (let i = 0; i < lines2.length; i++) {
          if (startIdx === -1 && /^\s*ONYXW\s*=/i.test(lines2[i])) {
            startIdx = i;
          }
          if (startIdx !== -1) {
            block.push(lines2[i]);
            for (const ch of lines2[i]) {
              if (ch === '(') depth++;
              if (ch === ')') depth--;
            }
            if (depth === 0 && block.length > 1) break;
          }
        }
        if (block.length > 0) {
          let newEntry = block.join('\n');
          if (variables.HOST) {
            newEntry = newEntry.replace(/(HOST\s*=\s*)[^\)]+/i, `$1${variables.HOST}`);
            count++;
          }
          if (variables.SERVICE_NAME) {
            newEntry = newEntry.replace(/(SERVICE_NAME\s*=\s*)[^\)]+/i, `$1${variables.SERVICE_NAME}`);
            count++;
          }
          lines2.splice(startIdx, block.length, ...newEntry.split('\n'));
          modified = lines2.join('\n');
        }
      } else {
        for (const r of cfg.replacements) {
          if (modified.includes(r.find)) {
            modified = modified.split(r.find).join(r.replace);
            count++;
          }
        }
      }

      await fs.mkdir(path.dirname(cfg.destPath), { recursive: true });
      await FileEngine.writeFile(cfg.destPath, modified);
      results.variablesReplaced.push({ path: cfg.destPath, count, success: true });
      lines.push(`[${ts()}] ✓ ${cfg.srcFile}: ${count > 0 ? `${count} replacements` : 'copied'} → ${cfg.destPath}`);
    } catch (err: any) {
      results.variablesReplaced.push({ path: cfg.destPath, count: 0, success: false, error: err.message });
      lines.push(`[${ts()}] ✗ ${cfg.srcFile}: ${err.message}`);
    }
  }
}

async function stepRestart(services: string[] | undefined, lines: string[]): Promise<void> {
  lines.push(`\n[${ts()}] ── Step 5: Restarting services ──`);
  const servicesToRestart = services || ['node-manager', 'forms', 'reports'];
  for (const svc of servicesToRestart) {
    try {
      const { execSync } = await import('child_process');
      if (svc === 'node-manager' || svc === 'weblogic') {
        try { execSync('taskkill /F /IM nodeManager.exe 2>nul', { timeout: 5000 }); lines.push(`[${ts()}] ✓ Stopped: ${svc}`); } catch { lines.push(`[${ts()}] — ${svc} not running`); }
      } else if (svc === 'forms') {
        try { execSync('taskkill /F /IM frmsrv.exe 2>nul', { timeout: 5000 }); lines.push(`[${ts()}] ✓ Stopped: ${svc}`); } catch { lines.push(`[${ts()}] — ${svc} not running`); }
      } else if (svc === 'reports') {
        try { execSync('taskkill /F /IM rwserver.exe 2>nul', { timeout: 5000 }); lines.push(`[${ts()}] ✓ Stopped: ${svc}`); } catch { lines.push(`[${ts()}] — ${svc} not running`); }
      }
    } catch {
      lines.push(`[${ts()}] — ${svc} skip (dev mode)`);
    }
  }
}

// ──────────────────────────────────────────────
// Execute single step
// ──────────────────────────────────────────────

const STEP_MAP: Record<string, (disk: string, variables: Record<string, string>, results: StepResult, lines: string[], services?: string[]) => Promise<void>> = {
  mkdir: (disk, _v, results, lines) => stepMkdir(disk, results, lines),
  rename: (disk, _v, results, lines) => stepRename(disk, results, lines),
  copy: (disk, _v, results, lines) => stepCopy(disk, results, lines),
  variables: (disk, variables, results, lines) => stepVariables(disk, variables, results, lines),
  restart: (_disk, _v, _results, lines, services) => stepRestart(services, lines),
};

async function executeStep(
  stepId: string,
  disk: string,
  variables: Record<string, string>,
  services?: string[]
): Promise<ExecuteResult> {
  const fn = STEP_MAP[stepId];
  if (!fn) throw new Error(`Unknown step: ${stepId}`);

  const results: StepResult = {
    dirsCreated: [],
    filesCopied: [],
    filesRenamed: [],
    variablesReplaced: [],
  };
  const lines: string[] = [];
  const timingStart = Date.now();

  lines.push(`[${ts()}] === Executing step: ${stepId} ===`);
  await fn(disk, variables, results, lines, services);
  const durationMs = Date.now() - timingStart;

  const stepTimings = [{ stepId, durationMs }];

  const dirsOk = results.dirsCreated.filter((r) => r.success).length;
  const dirsFailed = results.dirsCreated.filter((r) => !r.success).length;
  const filesOk = results.filesCopied.filter((r) => r.success).length;
  const filesFailed = results.filesCopied.filter((r) => !r.success).length;
  const renamesOk = results.filesRenamed.filter((r) => r.success).length;
  const renamesFailed = results.filesRenamed.filter((r) => !r.success).length;

  lines.push(`\n[${ts()}] Step "${stepId}" completed in ${durationMs}ms`);

  return {
    success: dirsFailed === 0 && filesFailed === 0 && renamesFailed === 0,
    output: lines.join('\n'),
    stepTimings,
    results,
    summary: {
      dirsTotal: results.dirsCreated.length,
      dirsOk,
      dirsFailed,
      filesTotal: results.filesCopied.length,
      filesOk,
      filesFailed,
      renamesTotal: results.filesRenamed.length,
      renamesOk,
      renamesFailed,
    },
  };
}

// ──────────────────────────────────────────────
// Execute all steps sequentially
// ──────────────────────────────────────────────

async function executeAll(
  disk: string,
  variables: Record<string, string>,
  services?: string[]
): Promise<ExecuteResult> {
  const results: StepResult = {
    dirsCreated: [],
    filesCopied: [],
    filesRenamed: [],
    variablesReplaced: [],
  };
  const stepTimings: { stepId: string; durationMs: number }[] = [];
  const allLines: string[] = [];

  allLines.push(`[${ts()}] === IX Installation Start ===`);
  allLines.push(`[${ts()}] Disk: ${disk}`);
  allLines.push(`[${ts()}] Source: ${IX_SOURCE_ROOT}`);

  const steps: { id: string; fn: () => Promise<void> }[] = [
    { id: 'mkdir', fn: () => stepMkdir(disk, results, allLines) },
    { id: 'rename', fn: () => stepRename(disk, results, allLines) },
    { id: 'copy', fn: () => stepCopy(disk, results, allLines) },
    { id: 'variables', fn: () => stepVariables(disk, variables, results, allLines) },
    { id: 'restart', fn: () => stepRestart(services, allLines) },
  ];

  for (const step of steps) {
    const start = Date.now();
    await step.fn();
    stepTimings.push({ stepId: step.id, durationMs: Date.now() - start });
  }

  const dirsOk = results.dirsCreated.filter((r) => r.success).length;
  const dirsFailed = results.dirsCreated.filter((r) => !r.success).length;
  const filesOk = results.filesCopied.filter((r) => r.success).length;
  const filesFailed = results.filesCopied.filter((r) => !r.success).length;
  const renamesOk = results.filesRenamed.filter((r) => r.success).length;
  const renamesFailed = results.filesRenamed.filter((r) => !r.success).length;

  allLines.push(`\n[${ts()}] ═══════════════════════════`);
  allLines.push(`[${ts()}] SUMMARY:`);
  allLines.push(`[${ts()}]   Dirs: ${dirsOk}/${results.dirsCreated.length} OK`);
  allLines.push(`[${ts()}]   Renames: ${renamesOk}/${results.filesRenamed.length} OK`);
  allLines.push(`[${ts()}]   Files: ${filesOk}/${results.filesCopied.length} OK`);
  allLines.push(`[${ts()}]   Vars: ${results.variablesReplaced.filter((r) => r.success).length}/${results.variablesReplaced.length} OK`);
  allLines.push(`[${ts()}] ═══════════════════════════`);

  return {
    success: dirsFailed === 0 && filesFailed === 0 && renamesFailed === 0,
    output: allLines.join('\n'),
    stepTimings,
    results,
    summary: {
      dirsTotal: results.dirsCreated.length,
      dirsOk,
      dirsFailed,
      filesTotal: results.filesCopied.length,
      filesOk,
      filesFailed,
      renamesTotal: results.filesRenamed.length,
      renamesOk,
      renamesFailed,
    },
  };
}

async function retryFailed(
  disk: string,
  failedItems: { type: string; path?: string; src?: string; dest?: string }[]
): Promise<{ success: boolean; retried: number; stillFailed: number; output: string }> {
  const lines: string[] = [];
  let retried = 0;
  let stillFailed = 0;

  lines.push(`[${ts()}] === Retrying failed items ===`);

  for (const item of failedItems) {
    try {
      if (item.type === 'dir' && item.path) {
        await fs.mkdir(item.path, { recursive: true });
        lines.push(`[${ts()}] ✓ Created: ${item.path}`);
        retried++;
      } else if (item.type === 'file' && item.src && item.dest) {
        const srcExists = await FileEngine.exists(item.src);
        if (!srcExists) {
          lines.push(`[${ts()}] ✗ Source missing: ${item.src}`);
          stillFailed++;
          continue;
        }
        await fs.mkdir(path.dirname(item.dest), { recursive: true });
        await FileEngine.copyItem(item.src, item.dest);
        lines.push(`[${ts()}] ✓ Copied: ${item.src}`);
        retried++;
      } else if (item.type === 'rename' && item.path) {
        lines.push(`[${ts()}] — Skip rename retry: ${item.path}`);
        retried++;
      } else if (item.type === 'variable' && item.path) {
        lines.push(`[${ts()}] — Skip variable retry: ${item.path}`);
        retried++;
      }
    } catch (err: any) {
      lines.push(`[${ts()}] ✗ Still failed: ${item.path || item.src} — ${err.message}`);
      stillFailed++;
    }
  }

  lines.push(`[${ts()}] Retry complete: ${retried} OK, ${stillFailed} still failed`);

  return {
    success: stillFailed === 0,
    retried,
    stillFailed,
    output: lines.join('\n'),
  };
}
