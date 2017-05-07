const express = require('express');

const queries = require('../db/queries.js');
const routeHelpers = require('./_helpers');

const router = express.Router();

router.get('/ping', (req, res) => {
  res.send('pong');
});

/*
get movies by user
 */
/* eslint-disable no-param-reassign */
router.get('/user', routeHelpers.ensureAuthenticated, (req, res, next) => {
  return queries.getSavedMovies(parseInt(req.user, 10))
  .then((movies) => {
    res.json({
      status: 'success',
      data: movies,
    });
  })
  .catch((err) => { return next(err); });
});
/* eslint-enable no-param-reassign */

/*
add new movie
 */
router.post('/', routeHelpers.ensureAuthenticated, (req, res, next) => {
  req.body.user_id = req.user;
  return queries.addMovie(req.body)
  .then(() => {
    res.json({
      status: 'success',
      data: 'Movie Added!',
    });
  })
  .catch((err) => { return next(err); });
});

module.exports = router;
