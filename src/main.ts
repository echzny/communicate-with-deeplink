import { app, BaseWindow, BrowserWindow, protocol, WebContentsView } from 'electron';
import path from 'node:path';
import * as crypto from "node:crypto";

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
app.setAsDefaultProtocolClient("hoge");

// hoge schema handler
const hogeHandler = (request: GlobalRequest): GlobalResponse => {
  const url = new URL(request.url);
  if (url.host === 'fuga') {
    return new Response(JSON.stringify({ message: 'piyo' }), {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } else {
    return new Response('Not Found', { status: 404 });
  }
};

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BaseWindow({
    width: 800,
    height: 600
  });

  const leftView = new WebContentsView({
    webPreferences: {
      partition: `persist:${crypto.randomUUID()}`
    }
  });
  leftView.setBounds({ x: 0, y: 0, width: 400, height: 600 });
  leftView.webContents.session.protocol.handle('hoge', hogeHandler);
  // Does not work global 'session.protocol.handle()' when enable 'partition' option.
  // Needs to set handler each webContents.
  mainWindow.getContentView().addChildView(leftView);

  const rightView = new WebContentsView({
    webPreferences: {
      partition: `persist:${crypto.randomUUID()}`
    }
  });
  rightView.setBounds({ x: 400, y: 0, width: 400, height: 600 });
  rightView.webContents.session.protocol.handle('hoge', hogeHandler);
  mainWindow.getContentView().addChildView(rightView);

  await leftView.webContents.session.extensions.loadExtension(path.join(__dirname, '../../submodules/hoge-extension/.output/chrome-mv3'));
  await rightView.webContents.session.extensions.loadExtension(path.join(__dirname, '../../submodules/hoge-extension/.output/chrome-mv3'));
  // and load the index.html of the app.
  /*if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }*/
  leftView.webContents.loadURL("https://google.com")
  rightView.webContents.loadURL("https://mail.google.com")

  // Open the DevTools.
  leftView.webContents.openDevTools({ mode: 'detach' });
  rightView.webContents.openDevTools({ mode: 'detach' });
};

app.on('ready', () => {
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
