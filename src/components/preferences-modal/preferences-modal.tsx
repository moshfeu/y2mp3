import * as React from 'react';
import { IModalProps, IDropdownOption } from '../../types';
import { Icon, Modal, Header, Button, Form, Dropdown, DropdownProps, Checkbox, CheckboxProps, Popup } from 'semantic-ui-react';
import { remote } from '../../services/electron-adapter';
import { settingsManager, IConfig } from '../../services/settings';
import { DownloadQuality, DownloadFormat } from '../../services/youtube-mp3-downloader'
import { SyntheticEvent } from 'react';
import { qualityOptions, formatOptions } from './lists';

interface IPreferencesModalState extends IConfig {
  downloadsFolder: string;
  audioQuality: DownloadQuality;
  playlistFolder: boolean;
  autoPaste: boolean;
  downloadFormat: DownloadFormat;
}

export class PreferencesModal extends React.Component<IModalProps, IPreferencesModalState> {
  componentWillMount() {
    const { downloadsFolder, audioQuality, playlistFolder, autoPaste, downloadFormat } = settingsManager;
    this.setState({
      downloadsFolder,
      audioQuality,
      playlistFolder,
      autoPaste,
      downloadFormat,
    });
  }

  openDirectoryExplorer = () => {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
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

  handleFieldChange = (e: SyntheticEvent, data: CheckboxProps | DropdownProps) => {
    const prop = typeof data.checked === 'undefined' ? data.value : data.checked;
    settingsManager[data.id] = prop;
    this.setState({
      [data.id]: prop
    } as Pick<IPreferencesModalState, keyof IPreferencesModalState>)
  }

  render() {
    const { open, onClose } = this.props;
    const { downloadsFolder, audioQuality, playlistFolder, autoPaste, downloadFormat } = this.state;

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
            <label>Download format</label>
            <label>
              <Dropdown
                scrolling
                className="menu-right"
                id="downloadFormat"
                options={formatOptions}
                onChange={this.handleFieldChange}
                value={downloadFormat} />
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
              <Checkbox id="playlistFolder" slider onChange={this.handleFieldChange} checked={playlistFolder} />
            </label>
          </Form.Field>
          <Form.Field inline>
            <label>
              Auto paste Youtube URLs <Popup trigger={<Icon name="help circle" />} content={`
              If enabled, when the app get focus and Youtube URL just copied, the URL will automatic pasted to the search's input
              `} inverted />
            </label>
            <label>
              <Checkbox id="autoPaste" slider onChange={this.handleFieldChange} checked={autoPaste} />
            </label>
          </Form.Field>
          <Form.Field inline>
            <label>Quality</label>
            <label>
              <Dropdown
                id="audioQuality"
                options={qualityOptions}
                onChange={this.handleFieldChange}
                value={audioQuality} />
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