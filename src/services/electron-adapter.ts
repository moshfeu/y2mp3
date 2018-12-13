import {IpcRenderer, Remote} from 'electron';

declare global {
  interface Window {
    require: (module: 'electron') => {
      ipcRenderer: IpcRenderer,
      remote: Remote
    };
  }
}

const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
export {
  ipcRenderer,
  remote
}