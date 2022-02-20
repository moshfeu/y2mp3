import * as React from 'react';
import { observer } from 'mobx-react';
import { ipcRenderer } from 'electron';
import { openAbout, openPreferences } from '../../services/modalsAndAlerts';
import { EWindowEvents } from '../../types';

@observer
export class ElectronEventsListener extends React.Component {
  componentDidMount() {
    ipcRenderer.on(EWindowEvents.OPEN_ABOUT, openAbout);
    ipcRenderer.on(EWindowEvents.OPEN_PREFERENCES, openPreferences);
  }

  render() {
    return <div>
      {this.props.children}
    </div>
  }
}