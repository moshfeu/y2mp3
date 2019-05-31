import * as React from 'react'
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon';
import { remote, shell } from '../../services/electron-adapter';
import { IModalProps } from '../../types';
import './about-modal.scss';

export class AboutModal extends React.Component<IModalProps> {
  render() {
    const { open, onClose } = this.props;
    const ExternalLink = props => <a href="javascript:void(0)" onClick={() => {
      shell.openExternal(props.href);
    }}>{props.children}</a>

    return (
      <Modal open={open} basic size='small' className="about-modal">
        <Header icon='info circle' content='About' />
        <Modal.Content>
          <p>
            <b>Version:</b> {remote.app.getVersion()}
          </p>
          <p>
            <b>Contact me:</b> <ExternalLink href="mailto:moshfeu.dev@gmail.com">moshfeu.dev@gmail.com</ExternalLink>
          </p>
          <p>
            <ExternalLink href="https://twitter.com/@y2mp3"><Icon name="twitter" />@y2mp3</ExternalLink>
          </p>
          <p>
            <ExternalLink href="https://github.com/moshfeu/y2mp3"><Icon name="github" />moshfeu/y2mp3</ExternalLink>
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