var nodemailer = require('nodemailer');

module.exports = function(credentials) {
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
    var generate_email_text = function(email, body) {
        text = "You received a message from: " + email;
        text += '\n\n';
        text += "They said: \n\n";
        text += body;
        return text;
    };
    return {
        sendEmail: function(senderEmail, subject, body) {
            emailConfig = {
                sender: senderEmail,
                from: senderEmail,
                to: credentials.gmail.user,
                subject: subject,
                text: generate_email_text(senderEmail, body)
            };
            var errorHandler = function(err) {
                if(err) console.error("Unable to send email: " + err);
            };
            mailTransport.sendMail(emailConfig, errorHandler);
        }
    }
}
