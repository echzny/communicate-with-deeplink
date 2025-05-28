# communicate-with-deeplink

> [Learning] Communicate between electron and chrome extension with deeplink

When startup, access to Electron's custom scheme "hoge://fuga" from Chrome Extension.
And response to Chrome Extension from Electron.

## Requirements

- macOS 15 (No tested on other platforms)
- Node.js 20 (No tested on other versions)

## Usage

```shell
$ git clone ...

$ git submodule update --init --recursive

$ npm install

$ npm install -w submodules/hoge-extension

$ npm run build -w submodules/hoge-extension

$ npm run start

-> see DevTools console.
```

## Note

Does not works global 'session.protocol.handle()' when enable 'partition' option.
In this case needs to set handler each webContents.

```
protocol.registerSchemesAsPrivileged([{
  scheme: 'hoge',
  ...
}]);
app.setAsDefaultProtocolClient('hoge');

const view = new WebContentsView({
  webPreferences: {
    partition: `persist:${crypto.randomUUID()}`
  }
});
session.protocol.handle('hoge', hogeHandler);  <- Does not works
view.webContents.session.protocol.handle('hoge', hogeHandler);  <- It works
```
