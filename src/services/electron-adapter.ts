import {IpcRenderer, Remote, Shell} from 'electron';

declare global {
  interface Window {
    require: (module: 'electron') => {
      ipcRenderer: IpcRenderer,
      remote: Remote
      shell: Shell
    };
  }
}

const electron = window.require('electron');
const { ipcRenderer, remote, shell } = electron;
export {
  ipcRenderer,
  remote,
  shell
}