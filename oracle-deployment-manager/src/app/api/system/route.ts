import { NextResponse } from 'next/server';
import os from 'os';
import { execSync } from 'child_process';
import type { SystemInfo } from '@/types';

function getSystemInfo(): SystemInfo {
  const hostname = os.hostname();
  const platform = os.platform();
  const release = os.release();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpus = os.cpus();

  let javaVersion = '';
  try {
    javaVersion = execSync('java -version 2>&1', { encoding: 'utf-8' }).split('\n')[0]?.replace(/"/g, '') || '';
  } catch {}

  let formsVersion = '';
  let reportsVersion = '';
  try {
    const formsHome = process.env.ORACLE_HOME || 'C:\\oracle\\forms';
    formsVersion = '12c';
    reportsVersion = '12c';
  } catch {}

  let weblogicStatus: 'running' | 'stopped' | 'error' = 'stopped';
  let nodeManagerStatus: 'running' | 'stopped' | 'error' = 'stopped';
  let listenerStatus: 'running' | 'stopped' | 'error' = 'stopped';
  let databaseStatus: 'running' | 'stopped' | 'error' = 'stopped';

  if (platform === 'win32') {
    try {
      const services = execSync('net start', { encoding: 'utf-8' }).toLowerCase();
      if (services.includes('weblogic')) weblogicStatus = 'running';
      if (services.includes('node manager')) nodeManagerStatus = 'running';
    } catch {}
  }

  let diskTotal = 0;
  let diskFree = 0;
  try {
    if (platform === 'win32') {
      const output = execSync('wmic logicaldisk where "DeviceID=\'C:\'" get Size,FreeSpace /format:csv', { encoding: 'utf-8' });
      const lines = output.trim().split('\n').filter((l: string) => l.trim());
      if (lines.length >= 2) {
        const parts = lines[1].split(',');
        diskFree = parseInt(parts[1]) || 0;
        diskTotal = parseInt(parts[2]) || 0;
      }
    }
  } catch {}

  return {
    hostname,
    os: `${platform} ${os.type()}`,
    windowsVersion: release,
    javaVersion,
    formsVersion,
    reportsVersion,
    weblogicStatus,
    nodeManagerStatus,
    listenerStatus,
    databaseStatus,
    diskSpace: { total: diskTotal, free: diskFree, used: diskTotal - diskFree },
    memory: { total: totalMem, used: totalMem - freeMem, free: freeMem },
    cpu: { usage: Math.round(cpus.reduce((acc, cpu) => acc + ((cpu.times.user + cpu.times.sys) / (cpu.times.user + cpu.times.sys + cpu.times.idle)) * 100, 0) / cpus.length), cores: cpus.length },
  };
}

export async function GET() {
  try {
    const info = getSystemInfo();
    return NextResponse.json(info);
  } catch (error: any) {
    return NextResponse.json({
      hostname: os.hostname(),
      os: `${os.platform()} ${os.type()}`,
      windowsVersion: os.release(),
      javaVersion: '',
      formsVersion: '',
      reportsVersion: '',
      weblogicStatus: 'stopped',
      nodeManagerStatus: 'stopped',
      listenerStatus: 'stopped',
      databaseStatus: 'stopped',
      diskSpace: { total: 0, free: 0, used: 0 },
      memory: { total: os.totalmem(), used: os.totalmem() - os.freemem(), free: os.freemem() },
      cpu: { usage: 0, cores: os.cpus().length },
    });
  }
}
