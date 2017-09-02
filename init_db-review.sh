#!/bin/bash

docker-compose -f docker-compose-review.yml run users-service-review knex migrate:latest --env test --knexfile app/knexfile.js
docker-compose -f docker-compose-review.yml run users-service-review knex seed:run --env test --knexfile app/knexfile.js
docker-compose -f docker-compose-review.yml run movies-service-review knex migrate:latest --env test --knexfile app/knexfile.js
docker-compose -f docker-compose-review.yml run movies-service-review knex seed:run --env test --knexfile app/knexfile.js
