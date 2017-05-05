import React from 'react';

const MovieCard = (props) => {
  return (
    <div className="col-xs-4">
      <div className="panel panel-info">
        <div className="panel-heading">
          <h3 className="panel-title">{props.title}</h3>
        </div>
        <div className="panel-body">
          <img src={props.posterUrl} alt="Presentation" />
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={ () => console.log(props.title) }
        >Add to Collection
        </button>
      </div>
    </div>
  )
}

export default MovieCard;
