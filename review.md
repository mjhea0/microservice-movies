# Review Environment

For a review environment...

### Build and Run the App

#### Set the Environment variables

```sh
$ export NODE_ENV=development
$ export REACT_APP_MOVIES_SERVICE_URL=http://localhost:3001
$ export REACT_APP_USERS_SERVICE_URL=http://localhost:3000
```

#### Fire up the Containers

Build the images:

```sh
$ docker-compose -f docker-compose-review.yml build
```

Run the containers:

```sh
$ docker-compose -f docker-compose-review.yml up -d
```
