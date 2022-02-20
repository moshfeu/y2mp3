import * as React from 'react'
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon';
import { ipcRenderer } from 'electron';
import { IModalProps } from '../../types';
import { ExternalLink } from '../external-link';
import { TWITTER_LINK, GITHUB_LINK, CONTACT_EMAIL } from '../../constants';
import './about-modal.scss';

export class AboutModal extends React.Component<IModalProps> {
  state = {
    version: '',
  }

  async componentDidMount() {
    const currentVersion = await ipcRenderer.invoke('version');
    this.setState({ version: currentVersion });
  }

  render() {
    const { open, onClose } = this.props;

    return (
      <Modal open={open} basic size='small' className="about-modal">
        <Header icon='info circle' content='About' />
        <Modal.Content>
          <p>
            <b>Version:</b> {this.state.version}
          </p>
          <p>
            <b>Contact me:</b> <ExternalLink href={CONTACT_EMAIL}>moshfeu.dev@gmail.com</ExternalLink>
          </p>
          <p>
            <ExternalLink href={TWITTER_LINK}><Icon name="twitter" />@y2mp3</ExternalLink>
          </p>
          <p>
            <ExternalLink href={GITHUB_LINK}><Icon name="github" />moshfeu/y2mp3</ExternalLink>
          </p>
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