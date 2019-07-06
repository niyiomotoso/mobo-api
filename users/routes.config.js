const UsersController = require('./controllers/users.controller');
const UsersWalletController = require('./controllers/user_wallet.controller');
const UserReferralsController = require('./controllers/user_referrals.controller');
const UserPartnersController = require('./controllers/user_partners.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.post('/users', [
        UsersController.insert
    ]);
    app.get('/users', [
        // ValidationMiddleware.validJWTNeeded,
        // PermissionMiddleware.minimumPermissionLevelRequired(PAID),
        UsersController.list
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

    app.delete('/partners/:userId/remove_partner', [
        UserPartnersController.removeFromUserPartners
    ]);

    app.get('/partners/:userId/get_partners', [
        UserPartnersController.getUserPartners
    ]);
};