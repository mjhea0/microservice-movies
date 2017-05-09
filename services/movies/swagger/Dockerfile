FROM node:latest

# set working directory
RUN mkdir /src
WORKDIR /src

# install app dependencies
ENV PATH /src/node_modules/.bin:$PATH
RUN npm install

# start app
CMD ["npm", "start"]
