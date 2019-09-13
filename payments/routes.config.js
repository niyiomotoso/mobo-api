const PaymentController = require('./controllers/payment.controller');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

var storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/payment_pictures'),
    filename: function (req, file, cb) {
    crypto.randomBytes(10, function(err, buffer) {
        cb(null, new Date().getTime()+buffer.toString('hex') + path.extname(file.originalname));
    });
}
});

const upload = multer({
    storage: storage,
}
);

exports.routesConfig = function (app) {
    app.post('/payments/paystack/log_payment', [
        PaymentController.logPaystackPayment
    ]);

    app.post('/payments/add_contribution_to_payment', [
        PaymentController.addContributionToPayment
    ]);

    app.get('/payments/:userId/get_log', [ 
       PaymentController.getLogs
    ]);
    
    // app.get('/payments/:userId/get_maximum_amount', [
      
    //     PaymentController.getMaximumPayment
    // ]);
    
};