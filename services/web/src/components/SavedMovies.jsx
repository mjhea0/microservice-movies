import React from 'react';
import { Link } from 'react-router-dom';

const SavedMovies = (props) => {

  return (
    <div>
      <br/><br/>
      <div className="text-center"><Link to='/'>Home</Link></div>
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
