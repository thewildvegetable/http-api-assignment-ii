// add modules
const http = require('http');
const url = require('url');
const query = require('querystring');

const responseHandler = require('./responses.js');

const urlStruct = {
  '/': responseHandler.getIndex,
  '/style.css': responseHandler.getCSS,
  '/getUsers': responseHandler.getUsers,
  '/addUser': responseHandler.addUser,
  notFound: responseHandler.notFound,
};

// set the port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

//handle POST requests
const handlePost = (request, response, parsedUrl) => {
  //if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    //uploads come in as a byte stream that we need 
    //to reassemble once it's all arrived
    const body = [];

    //if the upload stream errors out, just throw a
    //a bad request and send it back 
    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    //on 'data' is for each byte of data that comes in
    //from the upload. We will add it to our byte array.
    request.on('data', (chunk) => {
      body.push(chunk); 
    });

    //on end of upload stream. 
    request.on('end', () => {
      //combine our byte array (using Buffer.concat)
      //and convert it to a string value (in this instance)
      const bodyString = Buffer.concat(body).toString();
      //since we are getting x-www-form-urlencoded data
      //the format will be the same as querystrings
      //Parse the string into an object by field name
      const bodyParams = query.parse(bodyString);

      //pass to our addUser function
      responseHandler.addUser(request, res, bodyParams);
    });
  }
};

//handle GET requests
const handleGet = (request, response, parsedUrl) => {
  //route to correct method based on url
  if (parsedUrl.pathname === '/style.css') {
    responseHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    responseHandler.getUsers(request, response);
  } else {
    responseHandler.getIndex(request, response);
  }
};

const onRequest = (request, response) => {
  //parse url into individual parts
  //returns an object of url parts by name
  const parsedUrl = url.parse(request.url);

  //check if method was POST, otherwise assume GET 
  //for the sake of this example
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

// handle HTTP requests.
const onRequest = (request, response) => {
  // parse the url
  const parsedUrl = url.parse(request.url);

  // grab the query parameters
  const params = query.parse(parsedUrl.query);
  const acceptedTypes = request.headers.accept.split(',');

  // check if the path name exists
  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, acceptedTypes, params);
  } else {
    urlStruct.notFound(request, response, params);
  }
};

// start server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
