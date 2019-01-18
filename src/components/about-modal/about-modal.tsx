import * as React from 'react'
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon';
import { remote } from '../../services/electron-adapter';
import { IModalProps } from '../../types';

export class AboutModal extends React.Component<IModalProps> {
  render() {
    const { open, onClose } = this.props;
    return (
      <Modal open={open} basic size='small'>
        <Header icon='info circle' content='About' />
        <Modal.Content>
          <p>
            <b>Version:</b> {remote.app.getVersion()}
          </p>
          <p>
            <b>Contact me:</b> <a href="mailto:moshfeu.dev@gmail.com">moshfeu.dev@gmail.com</a>
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