// Dependencies
var credentials = require('./credentials.js');
var path        = require('path');
var express     = require('express');
var nodemailer  = require('nodemailer');
var app = express();
app.set('views', __dirname + '/views');

var hbsConfig = { layoutsDir: app.get('views') + "/layouts", defaultLayout: 'main'}
var handlebars = require('express-handlebars')(hbsConfig);

// Configure our app
var port = 3000;
app.set('port', process.env.PORT || port);

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

// Create our e-mail transporter
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password
    }
};
var mailTransport = nodemailer.createTransport(smtpConfig);

// Link in Body Parser middleware
app.use(require('body-parser').urlencoded({extended: true}));

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

// Create a contact me page
var contactPage = function(req, res) {
    res.render('contact');
};
var contactPagePost = function(req, res) {
    var generate_email_text = function(email, body) {
        text = "You received a message from: " + email;
        text += '\n\n';
        text += "They said: \n\n";
        text += body;
        return text;
    };
    var senderEmail = req.body.senderEmail;
    var subject = req.body.subject;
    var body = req.body.emailBody;
    if (senderEmail && subject && body) {
        emailConfig = {
            sender: senderEmail,
            from: senderEmail,
            to: credentials.gmail.user,
            subject: subject,
            text: generate_email_text(senderEmail, body),
        };
        var errorHandler = function(err) {
            if(err) console.error('Unable to send email: ' + err);
        };        
        mailTransport.sendMail(emailConfig, errorHandler);
        config = {'email': senderEmail, 'subject': subject, 'body': body};
        res.render('thank_you', config);
    } else {
        res.render('email_fail');
    }
};
app.get('/contact', contactPage);
app.post('/contact', contactPagePost);

// Create a blogs page
var blogsPage = function(req, res) {
    res.render('blogs');
};
app.get('/blogs', blogsPage);

// Create a doodads page
var doodadsPage = function(req, res) {
    res.render('doodads');
};
app.get('/doodads', doodadsPage);

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
