const nodeMailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const transporter = nodeMailer.createTransport({
  //   service: "gmail",
  host: process.env.EMAIL_HOST,
  //   port: 465, // defaults to 587 if is secure is false or 465 if true
  secure: true,
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS,
  },
});

const handlebarsOptions = {
  viewEngine: {
    // partialsDir: path.resolve('./src/views/partials'),
    // layoutsDir: path.resolve('./src/views/layouts'),
    defaultLayout: false,
    extName: ".hbs",
  },
  viewPath: path.resolve("./src/views"),
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarsOptions));

const send = async (email, subject, template, context) => {
  try {
    await transporter.sendMail({
      from: `Express e-commerce <${process.env.EMAIL_AUTH_USER}>`,
      to: email,
      subject: subject,
      template: template,
      context: context,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  transporter,
  send,
};
