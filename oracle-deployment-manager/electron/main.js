const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const PORT = 3000;
const isDev = !app.isPackaged;

let mainWindow = null;
let nextServer = null;

function getStaticDir() {
  if (isDev) {
    return path.join(__dirname, '..');
  }
  return path.join(process.resourcesPath, 'app');
}

function getOutDir() {
  if (isDev) {
    return path.join(__dirname, '..', '.next', 'standalone');
  }
  return path.join(process.resourcesPath, 'app', '.next', 'standalone');
}

async function startNextServer() {
  return new Promise((resolve, reject) => {
    const outDir = getOutDir();
    const serverFile = path.join(outDir, 'server.js');

    if (!fs.existsSync(serverFile)) {
      console.error('server.js not found at:', serverFile);
      console.error('Please run "npm run build" before starting Electron.');
      reject(new Error('Next.js build not found. Run "npm run build" first.'));
      return;
    }

    const env = {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1',
    };

    nextServer = spawn(process.execPath, [serverFile], {
      env,
      stdio: 'pipe',
      cwd: outDir,
    });

    let output = '';

    nextServer.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`[Next.js] ${text.trim()}`);
      if (text.includes('Ready') || text.includes('started') || text.includes('listening') || text.includes('3000')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.error(`[Next.js] ${text.trim()}`);
    });

    nextServer.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
      reject(err);
    });

    nextServer.on('exit', (code) => {
      console.log(`Next.js server exited with code ${code}`);
      nextServer = null;
    });

    setTimeout(() => {
      if (output.includes('Ready') || output.includes('started') || output.includes('3000')) {
        resolve();
      } else {
        resolve();
      }
    }, 5000);
  });
}

async function waitForServer(url, maxRetries = 30) {
  const http = require('http');
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(url, (res) => {
          resolve(res);
        }).on('error', reject);
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    title: 'Oracle Deployment Manager - Ultimate Solutions',
    icon: path.join(__dirname, 'icon.ico'),
    frame: true,
    backgroundColor: '#0B0F17',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    if (nextServer) {
      nextServer.kill('SIGTERM');
    }
    mainWindow.destroy();
    mainWindow = null;
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      console.log('Starting Next.js server...');
      await startNextServer();

      const url = `http://127.0.0.1:${PORT}`;
      const serverReady = await waitForServer(url);
      if (!serverReady) {
        console.warn('Server may not be fully ready, attempting to load anyway.');
      }

      console.log('Creating application window...');
      createWindow();
    } catch (err) {
      console.error('Failed to start application:', err);
      dialog.showErrorBox(
        'Application Error',
        `Failed to start the application:\n${err.message}\n\nMake sure you have run "npm run build" first.`
      );
      app.quit();
    }
  });

  app.on('window-all-closed', () => {
    if (nextServer) {
      nextServer.kill('SIGTERM');
    }
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Oracle Forms', extensions: ['fmb', 'fmt', 'fmx'] },
      { name: 'Oracle Reports', extensions: ['rdf', 'rep', 'rex'] },
      { name: 'Config Files', extensions: ['cfg', 'conf', 'ini', 'properties'] },
    ],
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('save-file', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath,
  });
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});
