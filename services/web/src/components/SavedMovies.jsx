import React from 'react';

const SavedMovies = (props) => {
  return (
    <div>
      <br/><br/>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Date Added</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            props.savedMovies.map((movies) => {
              return (
                <tr key={movie.id}>
                  <td>{ movie.id }</td>
                  <td>{ movie.title }</td>
                  <td>{ movie.date }</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default SavedMovies;
