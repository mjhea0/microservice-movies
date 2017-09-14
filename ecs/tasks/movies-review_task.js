function createMoviesTaskDefinition(accountID, region, tag, family, revision) {
  const taskDefinition = {
    containerDefinitions: [
      {
        name: 'movies-service-review',
        image: `${accountID}.dkr.ecr.${region}.amazonaws.com\/microservicemovies\/movies-service-review:${tag}`,
        essential: true,
        memoryReservation: 300,
        cpu: 300,
        portMappings: [
          {
            containerPort: 3000,
            hostPort: 0,
            protocol: 'tcp'
          }
        ],
        environment: [
          {
            name: 'DATABASE_URL',
            value: 'postgres://postgres:postgres@movies-db-review:5432/movies_dev'
          },
          {
            name: 'DATABASE_TEST_URL',
            value: 'postgres://postgres:postgres@movies-db-review:5432/movies_test'
          },
          {
            name: 'NODE_ENV',
            value: 'test'
          },
          {
            name: 'TOKEN_SECRET',
            value: 'changeme'
          }
        ],
        links: [
          'movies-db-review'
        ],
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': 'microservicemovies',
            'awslogs-region': region
          }
        }
      },
      {
        name: 'movies-db-review',
        image: `${accountID}.dkr.ecr.${region}.amazonaws.com\/microservicemovies\/movies-db-review:${tag}`,
        essential: true,
        memoryReservation: 300,
        cpu: 300,
        portMappings: [
          {
            containerPort: 5432
          }
        ],
        environment: [
          {
            name: 'POSTGRES_USER',
            value: 'postgres'
          },
          {
            name: 'POSTGRES_PASSWORD',
            value: 'postgres'
          }
        ],
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': 'microservicemovies',
            'awslogs-region': region
          }
        }
      },
      {
        name: 'swagger-review',
        image: `${accountID}.dkr.ecr.${region}.amazonaws.com\/microservicemovies\/swagger-review:${tag}`,
        essential: true,
        memoryReservation: 300,
        cpu: 300,
        portMappings: [
          {
            containerPort: 3001,
            hostPort: 0,
            protocol: 'tcp'
          }
        ],
        environment: [
          {
            name: 'NODE_ENV',
            value: 'test'
          }
        ],
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': 'microservicemovies',
            'awslogs-region': region
          }
        }
      }
    ],
    family: 'microservicemovies-review-movies-td'
  };
  return taskDefinition;
}

module.exports = {
  createMoviesTaskDefinition
};
