import * as React from 'react';

export interface IButtonProgressProps extends Partial<HTMLButtonElement> {
  text: string;
  onClick: () => void;
  progress?: number;
}

export interface IButtonProgressState {
  progress: number;
}

export default class ButtonProgress extends React.Component<IButtonProgressProps, IButtonProgressState> {
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

  get buttonCssState(): string {
    if (this.isLoading) {
      return 'state-loading';
    } else if (this.isDone) {
      return 'state-success';
    }
    return '';
  }

  render() {
    const { text, disabled } = this.props;
    const { progress } = this.state;

    return (
      <button data-hook="button" className={`button-progress ${this.buttonCssState}`} onClick={this.onClick} disabled={disabled} data-style="rotate-side-down" data-perspective="" data-horizontal="">
        <span className="progress-wrap">
          <span className="content" data-hook="content">{text}</span>
          <span className="progress">
            <span className={`progress-inner${!this.isLoading ? ' notransition' : ''}`} style={{width: `${progress}%`, opacity: 1}}></span>
            <span className="progress-counter">{progress}%</span>
          </span>
        </span>
      </button>
    );
  }
}