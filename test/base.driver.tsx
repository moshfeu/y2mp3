import './configEnzime';
import { ReactElement } from 'react';
import { ShallowWrapper, shallow } from 'enzyme';

export default class BaseDriver {
  protected wrapper: ShallowWrapper;

  render(component: ReactElement<any>) {
    this.wrapper = shallow(component);
    return this;
  }
}