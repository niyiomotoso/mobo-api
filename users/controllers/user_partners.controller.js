const UserModel = require('../models/users_portfolio.model');
const response = require('../../common/jsonResponse');

exports.addToUserPartners = (req, res) => {
    
    UserModel.addToUserPartners(req.params.userId, req.body)
        .then((result) => {
            if(result == "user_not_exist")
                res.status(200).send(response.failure("user_not_found","User does not exist"));
            else
                res.status(200).send(response.success(result, "Partner(s) Added Successfully"));
        });

};
exports.confirmUserPartnershipStatus = (req, res) => {
    
    UserModel.confirmUserPartnershipStatus( req.body)
        .then((result) => {
            if(result == "subject_user_not_exist")
                res.status(200).send(response.failure("subject_user_not_found", "invalid subject user id"));
            else if(result == "requested_partner_not_exist")
                res.status(200).send(response.failure("requested_partner_not_found", "invalid requested partner id"));
            else
                res.status(200).send(response.success(result, "Partnership Confirmed Successfully"));
        });

};

exports.removeFromUserPartners = (req, res) => {
UserModel.removeFromUserPartners(req.params.userId, req.body)
.then((result) => {
    if(result == "user_not_exist")
        res.status(200).send(response.failure("user_not_found","User does not exist"));
    else
        res.status(200).send(response.success(result, "Partner(s) Removed Successfully"));
});
};

exports.getUserPartners = (req, res) => {
    UserModel.getUserPartners(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};
