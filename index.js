// Dependencies
var express    = require('express');
var handlebars = require('express-handlebars').create({ defaultLayout: 'main'});

// Configure our app
var app = express();
var port = 3000;
app.set('port', process.env.PORT || port);

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



// Create a home page
var pageHome = function(req, res) {
    res.render('home');
};
app.get('/', pageHome);

// Create an about page
var pageAbout = function(req, res) {
    res.render('about');
};
app.get('/about', pageAbout);

// Create 404 page
var page404 = function(req, res) {
    res.status(404);
    res.render('404');
};
app.use(page404);

// Create 500 page
var page500 = function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
};
app.use(page500);

// Run the local server
var run_server = function() {
    console.log('Express started on http://localhost:' + app.get('port'));
};
app.listen(app.get('port'), run_server);
