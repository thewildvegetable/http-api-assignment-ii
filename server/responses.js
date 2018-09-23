const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const users = {};

// function to handle the index page
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// function to handle the css
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// function to send a json object
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  // stringify the object
  response.write(JSON.stringify(object));
  response.end();
};

//function to respond without json body
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

//return user object as JSON
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  respondJSON(request, response, 200, responseJSON);
};

//function to add a user from a POST body
const addUser = (request, response, body) => {
  //default json message
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  //check to make sure we have both fields
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  //default status code
  let responseCode = 201;

  //if that user's name already exists in our object return an updated
  if (users[body.name]) {
    responseCode = 204;
  } else {
    //otherwise create an object with that name
    users[body.name] = {};
  }

  //add or update fields for this user name
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  //if response is created, then set our created message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};


// function to show not found error
const notFound = (request, response, acceptedTypes) => {
  // error message with a description and consistent error id
  const responseJSON = {
    message: 'The page you are looking for was not found.',
  };

  // return a 404 not found error code
  return respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  getIndex,
  getCSS,
  getUsers,
  addUser,
  notFound,
};
