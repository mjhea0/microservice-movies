# Developing Microservices - Node, React, and Docker

[![Build Status](https://travis-ci.org/mjhea0/microservice-movies.svg?branch=master)](https://travis-ci.org/mjhea0/microservice-movies)
[![CircleCI](https://circleci.com/gh/mjhea0/microservice-movies.svg?style=svg)](https://circleci.com/gh/mjhea0/microservice-movies)

http://mherman.org/microservice-movies/

## Architecture

| Name             | Service | Container | Tech                 |
|------------------|---------|-----------|----------------------|
| Web              | Web     | web       | React, React-Router  |
| Movies API       | Movies  | movies    | Node, Express        |
| Movies DB        | Movies  | movies-db | Postgres             |
| Swagger          | Movies  | swagger   | Swagger UI           |
| Users API        | Users   | users     | Node, Express        |
| Users DB         | Users   | users-db  | Postgres             |
| Functional Tests | Test    | n/a       | TestCafe             |


## Want to learn how to build this project?

Check out the [blog post](http://mherman.org/blog/2017/05/11/developing-microservices-node-react-docker/).

## Want to use this project?

### Setup

1. Fork/Clone this repo

1. Download [Docker](https://docs.docker.com/docker-for-mac/install/) (if necessary)

1. Make sure you are using a Docker version >= 17:

    ```sh
    $ docker -v
    Docker version 17.03.0-ce, build 60ccb22
    ```

### Build and Run the App

#### Set the Environment variables

```sh
$ export NODE_ENV=development
```

#### Fire up the Containers

Build the images:

```sh
$ docker-compose build
```

Run the containers:

```sh
$ docker-compose up -d
```

#### Migrate and Seed

With the apps up, run:

```sh
$ sh init_db.sh
```

#### Sanity Check

Test out the following services...

##### (1) Users - http://localhost:3000

| Endpoint        | HTTP Method | CRUD Method | Result        |
|-----------------|-------------|-------------|---------------|
| /users/ping     | GET         | READ        | `pong`        |
| /users/register | POST        | CREATE      | add a user    |
| /users/login    | POST        | CREATE      | log in a user |
| /users/user     | GET         | READ        | get user info |

##### (2) Movies - http://localhost:3001

| Endpoint      | HTTP Method | CRUD Method | Result                    |
|---------------|-------------|-------------|---------------------------|
| /movies/ping  | GET         | READ        | `pong`                    |
| /movies/user  | GET         | READ        | get all movies by user    |
| /movies       | POST        | CREATE      | add a single movie        |

##### (3) Web - http://localhost:3007

| Endpoint   | HTTP Method | CRUD Method | Result                  |
|-------------|-------------|-------------|------------------------|
| /           | GET         | READ        | render main page       |
| /login      | GET         | READ        | render login page      |
| /register   | GET         | READ        | render register page   |
| /logout     | GET         | READ        | log a user out         |
| /collection | GET         | READ        | render collection page |

##### (4) Movies Database and (5) Users Database

To access, get the container id from `docker ps` and then open `psql`:

```sh
$ docker exec -ti <container-id> psql -U postgres
```

##### (6) Functional Tests

With the containers up running and TestCafe globally installed, run:

```sh
$ sh test.sh
```

##### (7) Swagger - http://localhost:3003/docs

Access Swagger docs at the above URL

#### Commands

To stop the containers:

```sh
$ docker-compose stop
```

To bring down the containers:

```sh
$ docker-compose down
```

Want to force a build?

```sh
$ docker-compose build --no-cache
```

Remove images:

```sh
$ docker rmi $(docker images -q)
```
