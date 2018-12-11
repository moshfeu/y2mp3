import './configEnzime';
import { ReactElement } from 'react';
import { ShallowWrapper, shallow } from 'enzyme';

export default class BaseDriver {
  protected wrapper: ShallowWrapper;

  render(component: ReactElement<any>) {
    this.wrapper = shallow(component);
    return this;
  }

  setProps<T>(props: Partial<T>) {
    this.wrapper.setProps(props);
  }

  flushTimeouts() {
    jest.runAllTimers();
  }
}