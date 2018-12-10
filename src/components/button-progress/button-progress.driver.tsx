import * as React from 'react';
import { SinonSpy } from 'sinon';
import { shallow } from 'enzyme';
import BaseDriver from '../../../test/base.driver';
import ButtonProgress from './button-progress';

export default class ButtonProgressDriver extends BaseDriver {
  private text: string;
  private onClick: jest.Mock;

  given = {
    text: (text: string) => {
      this.text = text;
      return this;
    },
    onClick: (onClick: jest.Mock) => {
      this.onClick = onClick;
      return this;
    }
  }

  when = {
    render: () => {
      this.render(<ButtonProgress
        onClick={this.onClick}
        text={this.text || ''}
      />);
      return this;
    }
  }

  get = {
    button: () => this.wrapper.find('[data-hook="button"]'),
    buttonText: () => this.get.button().find('[data-hook="content"]').text()
  }
}