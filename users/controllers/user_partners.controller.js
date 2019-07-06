const UserModel = require('../models/users_portfolio.model');
const response = require('../../common/jsonResponse');

exports.addToUserPartners = (req, res) => {
    
    UserModel.addToUserPartners(req.params.userId, req.body)
        .then((result) => {
            if(result == "user_not_exist")
                res.status(200).send(response.failure("User does not exist"));
            else
                res.status(200).send(response.success(result, "Partner(s) Added Successfully"));
        });

};

exports.removeFromUserPartners = (req, res) => {
UserModel.removeFromUserPartners(req.params.userId, req.body)
.then((result) => {
    if(result == "user_not_exist")
        res.status(200).send(response.failure("User does not exist"));
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
