// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require("nodemailer");

const logger = require("./logger");

// Using Ethereal Mail (NodeMailer)
const sendEmail = async (options) => {
  await nodemailer.createTestAccount((err) => {
    if (err) {
      logger.error(`Failed to create a testing account: ${err}`);
    }
  });
  // logger.info(
  //   `!!!!!! Generated user and password: ${options.user}, Password: ${options.pass} !!!!!`,
  // );

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  // setup email data
  const mailOptions = {
    from: '"Kazeem Ajut" <admin@gmail.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    // html: "<b>Hello world</b>", // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return logger.error(`There's an error: ${error}`);
    }
    logger.info(`Message sent: ${info.messageId}`);
    logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
};

module.exports = sendEmail;

///////////////////////////////////////////////////////////////////////////
// const sendEmail = async (options) => {
//   //   1) Create a transporter
//   const transporter = await nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: false,
//     logger: true,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     //   Activate in gmail "less secure app" option.
//   });
//   // logger.info(`------ It got here! --------`);
//   logger.info(`------ Transporter : ${JSON.stringify(transporter)} --------`);
//   //   2) Define the email options
//   const mailOptions = {
//     from: '"Tyrion Scott" <derik@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   //   3) Actually send the email
//   const transporter1 = await transporter.sendMail(mailOptions);
//   logger.info(`===== Transporter : ${JSON.stringify(transporter1)} ========`);
// };
//
// module.exports = sendEmail;
