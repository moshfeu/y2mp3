import * as React from 'react';
import { SinonSpy } from 'sinon';
import { shallow } from 'enzyme';
import BaseDriver from '../../../test/base.driver';
import { ButtonProgress, IButtonProgressProps } from './button-progress';

export default class ButtonProgressDriver extends BaseDriver {
  private text: string;
  private onClick: jest.Mock;
  private disabled: boolean;

  given = {
    text: (text: string) => {
      this.text = text;
      return this;
    },
    disabled: (disabled: boolean) => {
      this.disabled = disabled;
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
        disabled={this.disabled}
      />);
      return this;
    },
    set: {
      progress: (progress: number) => {
        this.setProps<IButtonProgressProps>({progress})
        return this;
      },
    }
  }

  get = {
    button: () => this.wrapper.find('[data-hook="button"]'),
    buttonText: () => this.get.button().find('[data-hook="content"]').text(),
    progressCounter: () => this.wrapper.find('[data-hook="progress-counter"]')
  }
}