const e = require('express');
const nodeMailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const companyEmail = 'ncathinh21@clc.fitus.edu.vn';

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,                          // defaults to 587 if is secure is false or 465 if true
    secure: true,
    auth: {
        user: companyEmail,
        pass: 'hkbu awdx tpdc trdr',    // app password -> https://stackoverflow.com/questions/59188483/error-invalid-login-535-5-7-8-username-and-password-not-accepted
    },
});

const handlebarsOptions = {
    viewEngine: {
        // partialsDir: path.resolve('./src/views/partials'),
        // layoutsDir: path.resolve('./src/views/layouts'),
        defaultLayout: false,
        extName: '.hbs',
    },
    viewPath: path.resolve('./src/views'),
    extName: '.hbs',
};

transporter.use('compile', hbs(handlebarsOptions));

const sendEmail = async (email, subject, template, context) => {
    try {
        await transporter.sendMail({
            from: `HackerRank Team <${companyEmail}>`,
            to: email,
            subject: subject,
            template: template,
            context: context,
        });
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = sendEmail;