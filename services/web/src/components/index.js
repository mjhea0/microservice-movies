import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const API_URL = 'http://www.omdbapi.com/?s=';

import SearchBar from './components/SearchBar';
import MovieList from './components/MovieList';

class App extends Component {

  constructor() {
    super()
    this.state = {
      movies: [],
      savedMovies: []
    }
    this.searchMovie('land before time')
  }

  searchMovie(term) {
    axios.get(`${API_URL}${term}`)
    .then((res) => { this.setState({ movies: res.data.Search }); })
    .catch((err) => { console.log(err); })
  }

  addMovie(title) {
    const data = { title: title }
    axios.post(`http://localhost:8080/api/v1/jobs`, data)
    .then((res) => { console.log(res) })
    .catch((err) => { console.log(err); });
  }

  render() {
    return (
      <div className="container">
        <h1>OMDB Movie Search</h1>
        <SearchBar searchMovie={this.searchMovie.bind(this)} />
        <MovieList movies={this.state.movies} />
      </div>
    )
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
