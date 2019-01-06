import * as React from 'react';
import { observer } from 'mobx-react';
import { ipcRenderer } from '../../services/electron-adapter';
import { openAbout, openPreferences } from '../../services/modalsAndAlerts';

@observer
export class ElectronEventsListener extends React.Component {
  componentDidMount() {
    ipcRenderer.on('open-about', openAbout);
    ipcRenderer.on('open-preferences', openPreferences);
  }

  render() {
    return <div>
      {this.props.children}
    </div>
  }
}