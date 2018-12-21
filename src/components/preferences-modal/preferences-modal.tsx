import * as React from 'react';
import { IModalProps } from '../../types';
import { Icon, Modal, Header, Button, Form } from 'semantic-ui-react';
import { remote } from '../../services/electron-adapter';
import { settingsManager, IConfig } from '../../services/settings';

interface IPreferencesModalState extends IConfig {
  downloadsFolder: string;
}

export class PreferencesModal extends React.Component<IModalProps, IPreferencesModalState> {
  componentWillMount() {
    this.setState({
      downloadsFolder: settingsManager.downloadsFolder
    });
  }

  openDirectoryExplorer = () => {
    remote.dialog.showOpenDialog({
      properties: [
        "openDirectory",
        "createDirectory",
      ],
      title: 'Choose a directory'
    }, (filePaths: string[]) => {
      if (filePaths) {
        const downloadsFolder = filePaths[0]
        settingsManager.downloadsFolder = downloadsFolder;
        this.setState({downloadsFolder});
      }
    })
  }

  render() {
    const { open, onClose } = this.props;
    const { downloadsFolder } = this.state;
    return (
      <Modal open={open} size='small' className="preferences-modal">
        <Header icon='settings' content='Preferences' />
        <Modal.Content>
        <Form>
          <Form.Field inline>
            <label>Downloads folder</label>
            <label>
              <span title={downloadsFolder} className="path-container">{downloadsFolder}</span>
              <Button className="open-directory-button" icon='folder open outline' onClick={this.openDirectoryExplorer} />
            </label>
          </Form.Field>
        </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={() => onClose()}>
            <Icon name='checkmark' /> Ok
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}