import { app, BrowserWindow, protocol, ipcMain, net, session } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Register the 'hoge' scheme as privileged
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'hoge',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.webContents.session.extensions.loadExtension(path.join(__dirname, '../../submodules/hoge-extension/.output/chrome-mv3'));
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: 'detach' });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Register the custom protocol handler for "hoge" schema
  protocol.handle('hoge', (request) => {
    const url = new URL(request.url);
    if (url.host === 'fuga') {
      return new Response(JSON.stringify({ message: 'piyo' }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  });

  // Handle IPC request to test the hoge protocol
  ipcMain.handle('test-hoge-protocol', async () => {
    return new Promise((resolve, reject) => {
      const request = net.request('hoge://fuga');

      let responseData = '';

      request.on('response', (response) => {
        response.on('data', (chunk) => {
          responseData += chunk.toString();
        });

        response.on('end', () => {
          try {
            const jsonData = JSON.parse(responseData);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.end();
    });
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
