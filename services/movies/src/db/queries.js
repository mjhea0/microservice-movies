const knex = require('./connection');

function getSavedMovies(userId) {
  return knex('movies').select().where('user_id', userId);
}

function addMovie(obj) {
  return knex('movies').insert(obj);
}

module.exports = {
  getSavedMovies,
  addMovie,
};
