import * as React from 'react';
import { Popup, Icon, List, ListItemProps, Dropdown, PopupProps } from 'semantic-ui-react';
import * as classNames from 'classnames';
import { formatOptions } from '../preferences-modal/lists';

export enum ButtonProgressStates {
  LOADING = 'state-loading',
  SUCCESS = 'state-success'
}
export interface IButtonProgressProps extends Partial<HTMLButtonElement> {
  options?: string[];
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

  componentWillReceiveProps(nextProps: IButtonProgressProps, currentProps: IButtonProgressProps) {
    if (nextProps.progress && currentProps.progress !== nextProps.progress) {
      if (nextProps.progress === this.progressDone) {
        this.done();
      }

      if (currentProps.progress != this.progressDone) {
        // if current progress is complete which means this operation is reset it again to the start
        // and that what `done` function do for the UI so ignore it
        this.setState({
          progress: nextProps.progress
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

  onClick = () => {
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
      return <List.Item active={isItemActive(option)} key={option} value={option}><span>{option}</span></List.Item>
    });
    const dropdownHandler = () => <div><Icon name='angle down' /></div>;
    const shouldShowDropdown = !this.isDone && !this.isLoading;

    if (!shouldShowDropdown) {
      return dropdownHandler()
    }
    return (
      <Popup trigger={dropdownHandler()} flowing hoverable>
        {!this.isLoading && !this.isDone &&
          <List selection onItemClick={onItemClick} items={items} />
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