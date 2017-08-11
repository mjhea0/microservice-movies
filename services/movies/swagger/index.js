const app = require('connect')();
const http = require('http');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');

const serverPort = 3001;
const options = {};

const spec = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerValidator());
  app.use(middleware.swaggerRouter(options));
  app.use(middleware.swaggerUi());
  http.createServer(app).listen(serverPort);
});
