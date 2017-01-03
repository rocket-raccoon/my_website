// Dependencies
var credentials    = require('./credentials.js');
var emailer        = require('./lib/emailer.js')(credentials);
var fs             = require('fs');
var path           = require('path');
var express        = require('express');
var nodemailer     = require('nodemailer');
var mongoose       = require('mongoose');
var csurf          = require('csurf');
var cookieParser   = require('cookie-parser'); 
//var $ = jQuery = require('jquery');
//require('./public/js/jquery.csv.js');

var Blog         = require('./models/blogs.js');
var app = express();
app.set('views', __dirname + '/views');

var hbsConfig = {
    layoutsDir: app.get('views') + "/layouts",
    defaultLayout: 'main',
    helpers: {
        static: function(name) {
            return require('./lib/static.js').map(name);
        }
    }
};
var handlebars = require('express-handlebars').create(hbsConfig);

// Get our data for mass murder statistics
/*
var murder_data_path = './public/csv/mass_shootings.csv';
var murder_data_str = fs.readFileSync(murder_data_path, 'UTF-8');
var data = $.csv.toObjects(murder_data_str);
console.log(data);
*/

// Configure our MongoDB Connection
var opts = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};
switch(app.get('env')) {
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

// Configure our app
var port = 3000;
app.set('port', process.env.PORT || port);

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var static_path = __dirname + '/public';
app.use(express.static(static_path));

// Link in body-parser, cookie-parser, and express-sessions
app.use(require('body-parser').urlencoded({extended: true}));
app.use(cookieParser(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret
}));

// Add CSRF protection
app.use(csurf());
app.use(function(req, res, next) {
    res.locals._csrfToken = req.csrfToken();
    next();
});

// Create a home page
var pageHome = function(req, res) {
	res.render('home');
};
app.get('/', pageHome);

// Create a bio page
var pageBio = function(req, res) {
    res.render('bio');
};
app.get('/bio', pageBio);

// Create a contact me page
var contactPage = function(req, res) {
    res.render('contact');
};
var contactPagePost = function(req, res) {
    var senderEmail = req.body.senderEmail;
    var subject = req.body.subject;
    var body = req.body.emailBody;
    if (senderEmail && subject && body) {
        emailer.sendEmail(senderEmail, subject, body);
        res.render('thank_you');
    } else {
        res.render('email_fail');
    }
};
app.get('/contact', contactPage);
app.post('/contact', contactPagePost);

// Create a blogs page
var blogsPage = function(req, res) {
    Blog.find().sort([['date', 'descending']]).exec(function(err, blogs) {
        var context = { blogs: blogs };
        res.render('blogs', context);
    });
};
app.get('/blogs', blogsPage);

// Create an individual blogs page
var singleBlogPageHtml = String(fs.readFileSync(__dirname + '/views/single_blog.handlebars'));
var individualBlogPage = function(req, res) {
    var blogId = req.params.blogId;
    Blog.findOne({_id: blogId}, function(err, blog) {
        if (typeof blog === 'undefined') {
            res.send("Could not find any blog post with the id: " + blogId);
        } else {
            var context = {
                title: blog.title,
                date: blog.date,
                text: blog.text
            };
            // Have to double compile unfortunately :(
            var html = handlebars.handlebars.compile(singleBlogPageHtml)(context);
            var static_context = {static: handlebars.helpers.static};
            html = handlebars.handlebars.compile(html)(static_context);
            var main_context = {
                body: html,
                layout: false
            };
            res.render('layouts/main', main_context);
        }
    });
}
app.get('/blogs/:blogId', individualBlogPage);

// Create a doodads page
var doodadsPage = function(req, res) {
    res.render('doodads');
};
app.get('/doodads', doodadsPage);

// Create a page for fractals
var fractalsPage = function(req, res) {
    res.render("fractals");
};
app.get("/fractals", fractalsPage);

// Create a page for the mass shooting map
var massShootingMapPage = function(req, res) {
    res.render("mass_shooting_map", data);
};
app.get('/mass_shooting_map', massShootingMapPage);

// Create a page for 3rd party election 2016 visualizations
var election2016Page = function(req, res) {
    res.render("election_2016");
};
app.get('/doodads/election2016', election2016Page);

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
