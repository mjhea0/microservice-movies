import React from 'react';
import { Link } from 'react-router-dom';

const SavedMovies = (props) => {

  return (
    <div>
      <h1>Collection</h1>
      <hr/>
      <div><Link to='/'>Home</Link></div>
      <br/><br/>
      <table className='table table-hover'>
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
            props.saved.map((movie) => {
              return (
                <tr key={movie.id}>
                  <td>{ movie.id }</td>
                  <td>{ movie.title }</td>
                  <td>{ movie.created_at }</td>
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
