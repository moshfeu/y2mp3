import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

import { join } from 'path';
import * as isDev from 'electron-is-dev';
import { platform, homedir } from 'os';
import { existsSync } from 'fs';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

enum eos {
  MAC = 'darwin',
  WINDOWS = 'win32',
};

let win: BrowserWindow;

function getIconFile() {
  switch (platform()) {
    case eos.MAC:
      return 'mac/icon.icns';
    case eos.WINDOWS:
    default:
      return 'win/icon.ico';
  }
}

function createWindow() {
  // Create the browser window.
  const webPreferences: Electron.WebPreferences = {
    additionalArguments: [
      `--appData=${app.getPath('appData')}`,
      `--isDev=${isDev}`
    ],
    nodeIntegration: true
  };

  win = new BrowserWindow({
    width: 480,
    height: 600,
    webPreferences,
    icon: join(__dirname, 'resources/icons', getIconFile())
  });

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
    const reactDevtoolsPath = join(homedir(), '/Library/Application\ Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.4.3_0/');
    const ex = existsSync(reactDevtoolsPath);
    if (ex) {
      BrowserWindow.addDevToolsExtension(reactDevtoolsPath);
    } else {
      console.error()
      alert('react devtools extension path not found');
    }
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });

  // Create the Application's main menu
  const template: MenuItemConstructorOptions[] = [{
      label: "Application",
      submenu: [{
          label: "About y2mp3",
          click: function () {
            win.webContents.send('open-about');
          }
        },
        {
          label: "Preferences",
          accelerator: "CommandOrControl+,",
          click: function () {
            win.webContents.send('open-preferences');
          }
        },
        {
          type: "separator"
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "CommandOrControl+Option+J",
          click: function () {
            win.webContents.openDevTools()
          }
        },
        {
          type: "separator"
        },
        {
          label: "Quit",
          accelerator: "CommandOrControl+Q",
          click: function () {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [{
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          role: "undo"
        },
        {
          label: "Redo",
          accelerator: "Shift+CmdOrCtrl+Z",
          role: "redo"
        },
        {
          type: "separator"
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          role: "cut"
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          role: "copy"
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          role: "paste"
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          role: "selectall"
        }
      ]
    },
    {
      label: "Support",
      submenu: [{
          label: "Need help? Give feedback?",
          click: function () {
            shell.openExternal('https://github.com/moshfeu/y2mp3/issues')
          }
        },
        {
          label: "Docs",
          click: function () {
            shell.openExternal('https://github.com/moshfeu/y2mp3/README.md')
          }
        },
        {
          type: "separator"
        },
        {
          label: "Made with ❤️ by MosheF",
          click: function () {
            shell.openExternal('https://github.com/moshfeu/')
          }
        },

      ]
    },
    {
      label: "Terms of use",
      submenu: [{
        label: "Disclaimer",
        click: function () {
          shell.openExternal('https://github.com/moshfeu/y2mp3#disclaimer')
        }
      }]
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.