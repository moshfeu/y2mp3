import * as React from 'react';
import { IModalProps, IQualityOption } from '../../types';
import { Icon, Modal, Header, Button, Form, Dropdown, DropdownProps, Checkbox, CheckboxProps, Popup } from 'semantic-ui-react';
import { remote } from '../../services/electron-adapter';
import { settingsManager, IConfig } from '../../services/settings';
import { DownloadQuality } from 'youtube-mp3-downloader';
import { SyntheticEvent } from 'react';

const qualityOptions: IQualityOption[] = ['highest', 'lowest'].map(option => ({
  text: option,
  value: option,
}));

interface IPreferencesModalState extends IConfig {
  downloadsFolder: string;
  quality: DownloadQuality;
  playlistFolder: boolean;
}

export class PreferencesModal extends React.Component<IModalProps, IPreferencesModalState> {
  componentWillMount() {
    const { downloadsFolder, audioQuality: quality, playlistFolder } = settingsManager;
    this.setState({
      downloadsFolder,
      quality,
      playlistFolder
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

  onChangeQuality = (e: SyntheticEvent, data: DropdownProps) => {
    const quality = data.value as DownloadQuality;

    settingsManager.audioQuality = quality;
    this.setState({
      quality
    });
  }

  onChangeDedicatedFolder = (e: SyntheticEvent, data: CheckboxProps) => {
    settingsManager.playlistFolder = data.checked;
    this.setState({
      playlistFolder: data.checked
    });
  }

  render() {
    const { open, onClose } = this.props;
    const { downloadsFolder, quality, playlistFolder } = this.state;

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
          <Form.Field inline>
            <label>
              Save the playlist in a dedicated
              folder <Popup trigger={<Icon name="help circle" />} content={`
              If enabled, the app will save each playlist to a dedicated folder (${downloadsFolder}/{playlist_name})
              `} inverted />
            </label>
            <label>
              <Checkbox slider onChange={this.onChangeDedicatedFolder} checked={playlistFolder} />
            </label>
          </Form.Field>
          <Form.Field inline>
            <label>Quality</label>
            <label>
              <Dropdown
                options={qualityOptions}
                onChange={this.onChangeQuality}
                value={quality} />
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