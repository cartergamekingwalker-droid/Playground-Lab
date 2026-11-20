
const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 850,
    minWidth: 980,
    minHeight: 650,
    title: 'Playground Lab',
    backgroundColor: '#10151e',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'game', 'index.html'));
}

autoUpdater.on('update-available', () => {
  console.log('Playground Lab update found. Downloading...');
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`Downloading update: ${Math.round(progress.percent)}%`);
});

autoUpdater.on('update-not-available', () => {
  console.log('Playground Lab is up to date!');
});

autoUpdater.on('update-downloaded', async () => {
  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Playground Lab Update',
    message: 'A new update is ready!',
    detail: 'Restart Playground Lab to install the update.',
    buttons: ['Restart now', 'Later'],
    defaultId: 0
  });

  if (result.response === 0) {
    autoUpdater.quitAndInstall();
  }
});

autoUpdater.on('error', (error) => {
  console.error('Update error:', error.message);
});

app.whenReady().then(() => {
  createWindow();

  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch((error) => {
      console.error('Could not check for updates:', error.message);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
