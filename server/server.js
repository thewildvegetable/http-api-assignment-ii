// add modules
const http = require('http');
const url = require('url');
const query = require('querystring');

const responseHandler = require('./responses.js');

// set the port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  // check url
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    const body = [];

    // if the upload stream errors out
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    // add data to byte array
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream.
    request.on('end', () => {
      // combine our byte array
      const bodyString = Buffer.concat(body).toString();

      // Parse the string into an object by field name
      const bodyParams = query.parse(bodyString);

      // pass to our addUser function
      responseHandler.addUser(request, res, bodyParams);
    });
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
  // route to correct method based on url
  if (parsedUrl.pathname === '/style.css') {
    responseHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    responseHandler.getUsers(request, response);
  } else if (parsedUrl.pathname === '/') {
    responseHandler.getIndex(request, response);
  }
    else{
        responseHandler.notFound(request, response);
    }
};

const onRequest = (request, response) => {
  // parse url into individual parts
  // returns an object of url parts by name
  const parsedUrl = url.parse(request.url);

  // check if method was POST, otherwise assume GET
  // for the sake of this example
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

// start server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
