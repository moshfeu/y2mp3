import ButtonProgressDriver from './button-progress.driver';
import {spy} from 'sinon';

describe('ButtonProgress', () => {
  let driver: ButtonProgressDriver;

  beforeEach(() => {
    driver = new ButtonProgressDriver();
  });

  it('should text be from prop', () => {
    const buttonText = 'text';

    driver
      .given.text(buttonText)
      .when.render();

    expect(driver.get.buttonText()).toBe(buttonText);
  });

  it('should call click callback when user clicks on it', () => {
    const onClick = jest.fn();

    driver
      .given.onClick(onClick)
      .when.render();

    driver.get.button().simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});