const UserModel = require('../models/users_portfolio.model');
const response = require('../../common/jsonResponse');

exports.addToUserReferrals = (req, res) => {
    
    UserModel.addToUserReferrals(req.params.userId, req.body)
        .then((result) => {
            if(result == "user_not_exist")
                res.status(200).send(response.failure("user_not_found","User does not exist"));
            else
                res.status(200).send(response.success(result, "Referral(s) messages sent"));
        });
};

exports.getUserReferrals = (req, res) => {
    UserModel.getUserReferrals(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};
