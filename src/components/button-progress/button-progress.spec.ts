import ButtonProgressDriver from './button-progress.driver';
import { ButtonProgressStates } from './button-progress';

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

  it('should be disabled if asked to', () => {
    driver
      .given.disabled(true)
      .when.render();

    expect(driver.get.button().prop('disabled')).toBeTruthy();
  });

  it('should show the given progress', () => {
    const progress = 50;
    driver
      .when.render()
      .when.set.progress(progress);

    expect(driver.get.progressCounter().text()).toBe(`${progress}%`)
  });


  it('should set loading class when progress is not full', () => {
    driver
      .when.render()
      .when.set.progress(50);

    expect(driver.get.button().hasClass(ButtonProgressStates.LOADING)).toBeTruthy()
  });

  it('should set done class when progress is not full', () => {
    driver
      .when.render()
      .when.set.progress(100);

    expect(driver.get.button().hasClass(ButtonProgressStates.SUCCESS)).toBeTruthy();

    driver.flushTimeouts();
    expect(driver.get.button().hasClass(ButtonProgressStates.SUCCESS)).toBeFalsy();
    expect(driver.get.button().hasClass(ButtonProgressStates.LOADING)).toBeFalsy();
  });
});