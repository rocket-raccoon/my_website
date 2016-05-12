// Dependencies
var express = require('express');

// Configure our app
var app = express();
var port = 3000;
app.set('port', process.env.PORT || port);

// Create a home page
var pageHome = function(req, res) {
    res.type('text/plain');
    res.send('The Tristanity Home Page');
};
app.get('/', pageHome);

// Create an about page
var pageAbout = function(req, res) {
    res.type('text/plain');
    res.send('This site is a personal website for me Alberto Tristan Benavides');
};
app.get('/about', pageAbout);

// Create 404 page
var page404 = function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Page Not Found');
};
app.use(page404);

// Create 500 page
var page500 = function(err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
};
app.use(page500);

// Run the local server
var run_server = function() {
    console.log('Express started on http://localhost:' + app.get('port'));
};
app.listen(app.get('port'), run_server);
