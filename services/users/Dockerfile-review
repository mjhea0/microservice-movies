FROM node:latest

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src

# add `/usr/src/node_modules/.bin` to $PATH
ENV PATH /usr/src/node_modules/.bin:$PATH

# install and cache app dependencies
ADD package.json /usr/src/package.json
RUN npm install

ADD ./entrypoint.sh /usr/src/entrypoint.sh

# add app
ADD . /usr/src/app

# start app
RUN chmod +x ./entrypoint.sh
CMD ["./entrypoint.sh"]
