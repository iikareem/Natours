const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const sendEmail = async options =>{

  // // specifies the settings and options needed
  // // to connect to the email service or SMTP server that will send the emails
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: false,
    logger: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });


  const mailOption = {
    form : 'Kareem Ashraf <KareemAshraf@email.com>',
    to : options.email,
    subject : options.subject,
    text : options.message
  };

  await transport.sendMail(mailOption);
}

module.exports = sendEmail;