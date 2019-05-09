import {IpcRenderer, Remote, Shell, Clipboard} from 'electron';

declare global {
  interface Window {
    require: (module: 'electron') => {
      ipcRenderer: IpcRenderer,
      remote: Remote
      shell: Shell,
      clipboard: Clipboard
    };
  }
}

const electron = window.require('electron');
const { ipcRenderer, remote, shell, clipboard } = electron;
export {
  ipcRenderer,
  remote,
  shell,
  clipboard,
}