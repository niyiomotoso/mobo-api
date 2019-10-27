const PaymentController = require('./controllers/payment.controller');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../common/config/env.config');
var FTPStorage = require('multer-ftp')
// var storage = multer.diskStorage({
//     destination: path.join(__dirname, '../public/payment_pictures'),
//     filename: function (req, file, cb) {
//     crypto.randomBytes(10, function(err, buffer) {
//         cb(null, new Date().getTime()+buffer.toString('hex') + path.extname(file.originalname));
//     });
// }
// });

// const upload = multer({
//     storage: storage,
// }
// );
var upload = multer({
    storage: new FTPStorage({
      basepath: config.payment_image_path,
      ftp: {
        host: 'ftp.leap.ng',
        secure: false, // enables FTPS/FTP with TLS
        user: 'ftpuser@leap.ng',
        password: '[^B66WQ}KjK;'
      }
    })
  });

exports.routesConfig = function (app) {
    app.post('/payments/paystack/log_payment', [
        PaymentController.logPaystackPayment
    ]);

    app.post('/payments/banktransfer/log_payment', upload.single('paymentEvidence'), [
        PaymentController.logManualTransferPayment
        ]);

    app.patch('/payments/banktransfer/update_payment', [
            PaymentController.updateManualTransferPayment
            ]);

    app.post('/payments/add_contribution_to_payment', [
        PaymentController.addContributionToPayment
    ]);
    
    app.get('/payments/:userId/get_log', [ 
       PaymentController.getLogs
    ]);
    
    app.get('/credithistory/:userId/get_log', [ 
        PaymentController.getCreditHistoryLogs
     ]);
    
    // app.get('/payments/:userId/get_maximum_amount', [
      
    //     PaymentController.getMaximumPayment
    // ]);
    
};