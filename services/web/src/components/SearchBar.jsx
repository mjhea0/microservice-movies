import React, { Component } from 'react';

class SearchBar extends Component {

  constructor(props) {
    super(props);
    this.state = { term: '' };
  }

  render() {
    return (
      <div className="search-bar input-group">
        <input
          value={this.state.term}
          className="form-control"
          placeholder="Search Movie Title..."
          onChange={event => this.setState({ term: event.target.value })}
        />
        <span className="input-group-btn">
          <button
            className="btn btn-success"
            type="button"
            onClick={() => this.props.searchMovie(this.state.term)}
          >
          Search!
          </button>
        </span>
      </div>
    );
  }
}

export default SearchBar;
