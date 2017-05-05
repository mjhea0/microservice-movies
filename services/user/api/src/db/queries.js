const knex = require('./connection');

function getAllLocations() {
  return knex('locations').select();
}

function getAllLocationsByUser(userId) {
  return knex('locations').select().where('user_id', userId);
}

function getSingleLocation(jobId) {
  return knex('locations').select().where('id', jobId);
}

function addLocation(obj) {
  return knex('locations').insert(obj);
}

function updateLocation(jobId, obj) {
  return knex('locations').update(obj).where('id', jobId);
}

function removeLocation(jobId) {
  return knex('locations').del().where('id', jobId);
}

module.exports = {
  getAllLocations,
  getAllLocationsByUser,
  getSingleLocation,
  addLocation,
  updateLocation,
  removeLocation,
};
