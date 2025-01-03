const express = require('express');
const app = express();

// Assign a callback function to handle ALL requests
app.all('/*', function (req, res) {
  // When this callback function is called, send this to client
  res.send('Hello World');
});

// Set the web server to listen to port 3000 (can be any port)
const server = app.listen(3000);
