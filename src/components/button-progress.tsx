import * as React from 'react';

export interface IButtonProgressProps {
  text: string;
  onClick: () => void;
}

export interface IButtonProgressState {
  progress: number;
}

export class ButtonProgress extends React.Component<IButtonProgressProps, IButtonProgressState> {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    }
  }

  get isLoading(): boolean {
    return this.state.progress > 0 && this.state.progress < 1;
  }

  get isDone(): boolean {
    return this.state.progress === 1;
  }

  done() {
    setTimeout(() => {
      this.setState({
        progress: 0
      });
    }, 2000);
  }

  onClick = () => {
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

      this.props.onClick();
    }

    makeProgress();
  }

  get buttonCssState(): string {
    if (this.isLoading) {
      return 'state-loading';
    } else if (this.isDone) {
      return 'state-success';
    }
  }

  render() {
    const { text } = this.props;
    const { progress } = this.state;

    return (
      <button className={`button-progress ${this.buttonCssState}`} onClick={this.onClick} data-style="rotate-side-down" data-perspective="" data-horizontal="">
        <span className="progress-wrap">
          <span className="content">{text}</span>
          <span className="progress">
            <span className={`progress-inner${!this.isLoading ? ' notransition' : ''}`} style={{width: `${progress * 100}%`, opacity: 1}}></span>
          </span>
        </span>
      </button>
    );
  }
}