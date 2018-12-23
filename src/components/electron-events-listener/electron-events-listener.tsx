import * as React from 'react';
import { observer } from 'mobx-react';
import { ipcRenderer } from '../../services/electron-adapter';
import store from '../../mobx/store';

@observer
export class ElectronEventsListener extends React.Component {
  componentDidMount() {
    ipcRenderer.on('open-about', () => store.isAboutOpen = true);
    ipcRenderer.on('open-preferences', () => store.isPreferencesOpen = true);
  }

  render() {
    return <div>
      {this.props.children}
    </div>
  }
}