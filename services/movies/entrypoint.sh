#!/bin/bash

knex migrate:latest --env test --knexfile app/knexfile.js
knex seed:run --env test --knexfile app/knexfile.js
npm start
