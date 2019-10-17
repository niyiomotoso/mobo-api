var config = require('../common/config/env.config')   
exports.userRegister = userRegister;
const nodemailer = require('nodemailer');

async function userRegister(firstname, email, token) {
                      let transporter = nodemailer.createTransport({
                        host: config.mailHost,
                        port: 465,
                        secure: true, 
                        auth: {
                            user: config.mailUsername, 
                            pass: config.mailPassword
                        }
                    });

                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                        from: 'Leap Support', // sender address
                        to: email, // list of receivers
                        subject: 'Leap Registration PIN', // Subject line
                        // text: 'Hello world?', // plain text body
                        html: '<b>Hello '+firstname+', </b><br> <br>Your registration PIN is '+token 
                    });

                    console.log('Message sent: %s', info.messageId);
                   }