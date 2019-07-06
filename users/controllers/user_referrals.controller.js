const UserModel = require('../models/users_portfolio.model');
const response = require('../../common/jsonResponse');

exports.addToUserReferrals = (req, res) => {
    
    UserModel.addToUserReferrals(req.params.userId, req.body)
        .then((result) => {
            if(result == "referral_exist")
                res.status(200).send(response.failure("Referral Already Added"));
            else
                res.status(200).send(response.success(result, "Referral Added Successfully"));
        });
};

exports.getUserReferrals = (req, res) => {
    UserModel.getUserReferrals(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};
