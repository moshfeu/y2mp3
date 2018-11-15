import * as React from 'react';

interface IFormProps {
  onSubmit: (url: string) => void;
  onClear: () => void;
}

interface IFormState {
  terms: string;
  containerActive: boolean;
}

export class Form extends React.Component<IFormProps, IFormState> {
  private clear() {
    this.setState({
      containerActive: false,
      terms: ''
    });
    this.props.onClear();
  }

  private searchClick() {
    const { onSubmit } = this.props;
    const { containerActive, terms } = this.state;

    if (!containerActive) {
      this.setState({containerActive: true});
    } else if (terms) {
      onSubmit(terms);
    }
  }

  render() {
    const { terms } = this.state;
    const { onSubmit } = this.props;

    return (
      <form onSubmit={() => terms && onSubmit(terms)}>
        <div className="search-wrapper">
          <div className="input-holder">
            <input type="text" className="search-input" placeholder="Type to search" />
            <button className="search-icon" onClick={this.searchClick}><span></span></button>
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