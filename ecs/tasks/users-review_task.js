function createUsersTaskDefinition(accountID, region, tag, family, revision) {
  const taskDefinition = {
    containerDefinitions: [
      {
        name: 'users-service-review',
        image: `${accountID}.dkr.ecr.${region}.amazonaws.com\/microservicemovies\/users-service-review:${tag}`,
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
            value: 'postgres://postgres:postgres@users-db-review:5432/users_dev'
          },
          {
            name: 'DATABASE_TEST_URL',
            value: 'postgres://postgres:postgres@users-db-review:5432/users_test'
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
          'users-db-review'
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
        name: 'users-db-review',
        image: `${accountID}.dkr.ecr.${region}.amazonaws.com\/microservicemovies\/users-db-review:${tag}`,
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
      }
    ],
    family: 'microservicemovies-review-users-td'
  };
  return taskDefinition;
}

module.exports = {
  createUsersTaskDefinition
};
