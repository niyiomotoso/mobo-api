const UsersController = require('./controllers/users.controller');
const UsersWalletController = require('./controllers/user_wallet.controller');
const UserReferralsController = require('./controllers/user_referrals.controller');
const UserPartnersController = require('./controllers/user_partners.controller');
const config = require('../common/config/env.config');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');
const multerDrive = require('multer-drive');
var privatekey = require("../common/config/leapng-ac9189a679b4.json")
// var auth = new google.auth.JWT(
//   privatekey.client_email,
//   null,
//   privatekey.private_key,
//   ['https://www.googleapis.com/auth/drive']
// );

// // Authenticate request
// auth.authorize(function (err, tokens) {
//   if (err) {
//       console.log(err);
//     console.log("Google autorization failed");
//     return;
//   } else {
//     console.log(tokens);
//     console.log("Google autorization complete");
//   }
// });

// const auth = new google.auth.JWT({
//     email: config.mailUsername,
//     key: "AIzaSyB6Z-HuKENzjHvHVBvj7iW7vHEffNleA4c", 
//     scopes: ['https://www.googleapis.com/auth/drive'],
// });

var storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/profile_pictures'),
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

// const upload = multer({
//     storage: multerDrive(auth),
//     // Rest of multer's options
// });

exports.routesConfig = function (app) {
    app.post('/users', [
        UsersController.insert
    ]);
    app.post('/users/resendActivationCode', [
        UsersController.resendActivationCode
    ]);

    app.post('/users/resetPassword', [
        UsersController.resetPassword
    ]);

    app.post('/users/verifyNewPassword', [
         UsersController.verifyNewPassword
    ]);
    
    app.post('/users/verifyPhone', [
        UsersController.verifyPhone
    ]);
    app.get('/users', [
        // ValidationMiddleware.validJWTNeeded,
        // PermissionMiddleware.minimumPermissionLevelRequired(PAID),
        UsersController.list
    ]);
    app.get('/users/:userId/get_partners_projects', [
         UsersController.getUserPartnerProjects
    ]);
    
    app.get('/users/:userId/get_partners_loans', [
        UsersController.getUserPartnerLoans
   ]);
   

    app.get('/users/:userId', [
        // ValidationMiddleware.validJWTNeeded,
        // PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        // PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getById
    ]);
    app.patch('/users/:userId', [
       
        UsersController.patchById
    ]);

    app.post('/users/profile_pic/:userId',upload.single('avatar'), [
       
        UsersController.uploadUserProfilePic
    ]);


    app.delete('/users/:userId', [
        // ValidationMiddleware.validJWTNeeded,
        // PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.removeById
    ]);

    //wallet endpoint
    app.get('/wallet/:userId/get_balance', [
       // ValidationMiddleware.validJWTNeeded,
        UsersWalletController.getWalletBalanceByUserid
    ]);
    app.post('/wallet/:userId/add_to_wallet_balance', [
        // ValidationMiddleware.validJWTNeeded,
         UsersWalletController.addToWalletBalanceByUserid
     ]);
     app.post('/wallet/:userId/deduct_from_wallet_balance', [
        // ValidationMiddleware.validJWTNeeded,
         UsersWalletController.removeFromWalletBalanceByUserid
     ]);

    //referrals endpoint
    app.post('/referrals/:userId/add_referral', [
        UserReferralsController.addToUserReferrals
    ]);

    app.get('/referrals/:userId/get_referrals', [
        UserReferralsController.getUserReferrals
    ]);



    app.post('/partners/:userId/add_partner', [
        UserPartnersController.addToUserPartners
    ]);

    app.post('/partners/confirm_partnership_status', [
        UserPartnersController.confirmUserPartnershipStatus
    ]);

    app.post('/partners/:userId/remove_partner', [
        UserPartnersController.removeFromUserPartners
    ]);

    app.get('/partners/:userId/get_partners', [
        UserPartnersController.getUserPartners
    ]);
};