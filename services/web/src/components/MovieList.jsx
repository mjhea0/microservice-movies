import React from 'react';
import MovieCard from './MovieCard';

const MovieList = (props) => {
  return (
    <div>
      {props.movies.map(movie => (
        <MovieCard
          key={movie.imdbID}
          title={movie.Title}
          posterUrl={movie.Poster}
        />
      ))}
    </div>
  )
}

export default MovieList;
