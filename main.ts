import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
  Tray,
  ipcMain,
} from 'electron';

import { join } from 'path';
import * as isDev from 'electron-is-dev';
import { platform, homedir } from 'os';
import { existsSync } from 'fs';
import * as fixPath from 'fix-path';

enum EWindowEvents {
  OPEN_ABOUT = 'open-about',
  OPEN_PREFERENCES = 'open-preferences',
  WINDOW_FOCUS = 'window-focus'
}

enum eos {
  MAC = 'darwin',
  WINDOWS = 'win32',
};

fixPath();
let win: BrowserWindow;
let tray: Tray;

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

  createMenu();

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'undocked'});

    const reactDevtoolsPath = join(homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.4.3_0/');
    const ex = existsSync(reactDevtoolsPath);
    if (ex) {
      BrowserWindow.addDevToolsExtension(reactDevtoolsPath);
    } else {
      console.error('react devtools extension path not found');
    }
  }

  win.on('closed', () => {
    win = null;
    tray.destroy();
    tray = null;
  }).on('focus', () => {
    win.webContents.send(EWindowEvents.WINDOW_FOCUS);
  });

  try {
    tray = new Tray('./app-resources/tray.png');
    tray.on('click', () => win.focus());

    ipcMain.on('tray', (_, message: string) => {
      tray.setToolTip(message);
    });
  } catch (error) {
    console.error(error);
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function createMenu() {
  // Create the Application's main menu
  const template: MenuItemConstructorOptions[] = [{
    label: "Application",
    submenu: [{
        label: "About y2mp3",
        click: function () {
          win.webContents.send(EWindowEvents.OPEN_ABOUT);
        }
      },
      {
        label: "Preferences",
        accelerator: "CommandOrControl+,",
        click: function () {
          win.webContents.send(EWindowEvents.OPEN_PREFERENCES);
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
      }]
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
            shell.openExternal('https://github.com/moshfeu/y2mp3/blob/master/README.md')
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