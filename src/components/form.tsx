import * as React from 'react';

interface IFormProps {
  onSubmit: (url: string) => void;
  onClear: () => void;
  hasResult: boolean;
}

interface IFormState {
  terms: string;
  containerActive: boolean;
}

export class Form extends React.Component<IFormProps, IFormState> {
  constructor(props) {
    super(props);

    this.state = {
      terms: 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK',
      containerActive: true
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
    const { terms, containerActive } = this.state;
    const { hasResult } = this.props;

    return (
      <form onSubmit={this.onSubmit}>
        <div className={['search-wrapper', containerActive && 'active' || '', hasResult && '-has-result' || ''].join(' ')}>
          <div className="input-holder">
            <input className="search-input" type="url" id="playlistUrl" placeholder="Type to search" value={terms} onChange={e => this.setState({terms: e.target.value})} />
            <button type="button" className="search-icon" onClick={this.searchClick}><span></span></button>
          </div>
          <span className="close" onClick={this.clear}></span>
          <div className="result-container">
            {this.props.children}
          </div>
        </div>
      </form>
    );
  }
}