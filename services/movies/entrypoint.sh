#!/bin/bash

echo "Waiting for postgres..."

while ! nc -z users-db-review 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

knex migrate:latest --env test --knexfile app/knexfile.js
knex seed:run --env test --knexfile app/knexfile.js
npm start
