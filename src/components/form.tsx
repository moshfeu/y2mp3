import * as React from 'react';
import { isDev } from '../services/additional-arguments';

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
  constructor(props) {
    super(props);
    this.state = {
      terms: isDev ? 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK' : '',
      containerActive: true,
      inProcess: false
    }
  }

  componentWillReceiveProps(newProps: IFormProps, currentProps: IFormProps) {
    if (newProps.inProcess !== currentProps.inProcess) {
      this.setState({
        inProcess: newProps.inProcess
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
        <form onSubmit={this.onSubmit}>
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