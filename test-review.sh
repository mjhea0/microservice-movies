#!/bin/bash

fails=''

inspect() {
  if [ $1 -ne 0 ] ; then
    fails="${fails} $2"
  fi
}

docker-compose -f docker-compose-review.yml run users-service-review npm test
inspect $? users-service

docker-compose -f docker-compose-review.yml run movies-service-review npm test
inspect $? movies-service

testcafe firefox tests/**/*.js
inspect $? e2e

if [ -n "${fails}" ];
  then
    echo "Tests failed: ${fails}"
    exit 1
  else
    echo "Tests passed!"
    exit 0
fi
