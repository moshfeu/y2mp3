import * as React from 'react';
import { Popup, Icon, List, ListItemProps, Dropdown, PopupProps, Menu, MenuItemProps } from 'semantic-ui-react';
import * as classNames from 'classnames';
import { IButtonProgressOptions } from '../../types';

export enum ButtonProgressStates {
  LOADING = 'state-loading',
  SUCCESS = 'state-success'
}

export interface IButtonProgressProps extends Partial<HTMLButtonElement> {
  options?: IButtonProgressOptions[];
  onItemClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: ListItemProps) => void;
  isItemActive?: (option: string) => boolean;
  text: string;
  onClick: () => void;
  progress?: number;
}

export interface IButtonProgressState {
  progress: number;
}

export class ButtonProgress extends React.Component<IButtonProgressProps, IButtonProgressState> {
  private readonly progressDone = 100;

  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    }
  }

  get isLoading(): boolean {
    return this.state.progress > 0 && this.state.progress < this.progressDone;
  }

  get isDone(): boolean {
    return this.state.progress === this.progressDone;
  }

  componentDidUpdate(oldProps: IButtonProgressProps) {
    const { progress } = this.props;
    if (progress && oldProps.progress !== progress) {
      if (progress === this.progressDone) {
        this.done();
      }

      if (oldProps.progress != this.progressDone) {
        // if current progress is complete which means this operation is reset it again to the start
        // and that what `done` function do for the UI so ignore it
        this.setState({
          progress: progress
        });
      }
    }
  }

  done() {
    setTimeout(() => {
      this.setState({
        progress: 0
      });
    }, 2000);
  }

  onClick = (e: React.SyntheticEvent) => {
    if ((e.target as Element).classList.contains('disabled')) {
      return;
    }
    if (this.props.onClick) {
      return this.props.onClick();
    }
    const makeProgress = () => {
      const {progress} = this.state;
      if (progress === 1) {
        this.done();
        return;
      }
      const newProgress = Math.min(progress + (Math.random() / 10), 1);
      this.setState({
        progress: newProgress
      })
      setTimeout(() => {
        makeProgress()
      }, Math.random()*500);
    }

    makeProgress();
  }

  get buttonCssState(): ButtonProgressStates | '' {
    if (this.isLoading) {
      return ButtonProgressStates.LOADING;
    } else if (this.isDone) {
      return ButtonProgressStates.SUCCESS;
    }
    return '';
  }

  optionsDropdown = () => {
    const { options = [], onItemClick, isItemActive = () => false } = this.props;

    const hasOptions = !!options.length;
    if (!hasOptions) {
      return;
    }
    const items = options.map(option => {
      return <Menu.Item disabled={option.header} key={option.content} value={option.content}><span className={classNames({disabled: option.header})}>{option.content}</span></Menu.Item>
    });
    const dropdownHandler = () => <div><Icon name='angle down' /></div>;
    const shouldShowDropdown = !this.isDone && !this.isLoading;

    if (!shouldShowDropdown) {
      return dropdownHandler();
    }
    return (
      <Popup trigger={dropdownHandler()} className="format-options" flowing hoverable >
        {!this.isLoading && !this.isDone &&
          <Menu vertical secondary onItemClick={onItemClick} items={items} activeIndex={options.findIndex(i => isItemActive(i.content))} />
        }
      </Popup>
    );
  }

  render() {
    const { text, disabled, options = [] } = this.props;
    const { progress } = this.state;

    return (
      <button data-hook="button" className={`button-progress ${this.buttonCssState}`} onClick={this.onClick} disabled={disabled} data-style="rotate-side-down" data-perspective="" data-horizontal="">
        <span className="progress-wrap">
          <span className={classNames(['content', {'-with-options': options.length }])} data-hook="content">
            {text}
            {this.optionsDropdown()}
          </span>
          <span className="progress">
            <span className={`progress-inner${!this.isLoading ? ' notransition' : ''}`} style={{width: `${progress}%`, opacity: 1}}></span>
            <span className="progress-counter" data-hook="progress-counter">{progress}%</span>
          </span>
        </span>
      </button>
    );
  }
}