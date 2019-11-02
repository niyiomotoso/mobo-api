const PaymentController = require('./controllers/payment.controller');
const multer = require('multer');
const config = require('../common/config/env.config');
const path = require('path');
const crypto = require('crypto');
var AWS = require('aws-sdk');
var multerS3 = require('multer-s3');

 
AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  });

var s3 = new AWS.S3();
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'leapuploads',
    metadata: function (req, file, cb) {
       cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        crypto.randomBytes(10, function(err, buffer) {
            cb(null, new Date().getTime()+buffer.toString('hex') + path.extname(file.originalname));
        });
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