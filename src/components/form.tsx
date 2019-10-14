import * as React from 'react';
import { isDev } from '../services/additional-arguments';
import { ipcRenderer, clipboard } from '../services/electron-adapter';
import { EWindowEvents } from '../types';
import { isYoutubeURL } from '../services/api';
import { settingsManager } from '../services/settings';
import { showSuccessPasted } from '../services/modalsAndAlerts';

interface IFormProps {
  onSubmit: (url: string) => void;
  onClear: () => void;
  hasResult: boolean;
  inProcess: boolean;
}

interface IFormState {
  terms: string;
  containerActive: boolean;
  inProcess: boolean;
}

export class Form extends React.Component<IFormProps, IFormState> {
  constructor(props: IFormProps) {
    super(props);
    this.state = {
      terms: isDev ? 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK' : '',
      containerActive: true,
      inProcess: false
    }
  }

  componentDidMount() {
    ipcRenderer.on(EWindowEvents.WINDOW_FOCUS, () => {
      if (!settingsManager.autoPaste) {
        return;
      }
      const clipboardContent = clipboard.readText();
      if (isYoutubeURL(clipboardContent) && clipboardContent !== this.state.terms) {
        showSuccessPasted();
        this.setState({
          terms: clipboardContent
        });
      }
    });
  }

  componentDidUpdate(prevProps: IFormProps) {
    if (prevProps.inProcess !== this.props.inProcess) {
      this.setState({
        inProcess: this.props.inProcess
      });
    }
  }

  private clear = (): void => {
    this.setState({
      containerActive: false,
      terms: ''
    });
    this.props.onClear();
  }

  private searchClick = (): void => {
    const { onSubmit } = this.props;
    const { containerActive, terms } = this.state;

    if (!containerActive) {
      this.setState({containerActive: true});
    } else if (terms) {
      onSubmit(terms);
    }
  }

  private onSubmit = (e: React.FormEvent): void => {
    const { terms } = this.state;
    const { onSubmit } = this.props;
    e.preventDefault();
    if (terms && onSubmit) {
      onSubmit(terms);
    }
  }

  render() {
    const { terms, containerActive, inProcess } = this.state;
    const { hasResult } = this.props;

    return (
      <div className={['search-wrapper', containerActive && 'active' || '', hasResult && '-has-result' || '', inProcess && '-in-process' || ''].join(' ')}>
        <form className="search-form" onSubmit={this.onSubmit}>
          <div className="input-holder">
            <input className="search-input" type="url" placeholder="https://www.youtube.com/..." value={terms} onChange={e => this.setState({terms: e.target.value})} />
            <button type="button" className="search-icon" onClick={this.searchClick} disabled={inProcess}>
              <span></span>
            </button>
          </div>
          <span className="close" onClick={this.clear}></span>
        </form>
        <div className="result-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}