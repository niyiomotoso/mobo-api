const UserModel = require('../models/users_portfolio.model');
const response = require('../../common/jsonResponse');


exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getWalletBalanceByUserid = (req, res) => {
    UserModel.getUserWalletBalance(req.params.userId)
        .then((result) => {
            if(result == "user_not_found")
            res.status(200).send(response.failure("user_not_found","User does not exist"));
        else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        });
};
exports.addToWalletBalanceByUserid = (req, res) => {
    if(req.body.amount == undefined || req.body.amount == null){
        res.status(200).send(response.failure("amount_not_set","Amount is not set"));
    }
    else{
    UserModel.addToWalletBalance(req.params.userId, req.body)
        .then((result) => {
            if(result == "user_not_found")
            res.status(200).send(response.failure("user_not_found","User does not exist"));
        else{
            res.status(200).send(response.success(result, "Added Successfully"));
        }
        });
    }
};
exports.removeFromWalletBalanceByUserid = (req, res) => {
    UserModel.removeFromWalletBalance(req.params.userId, req.body)
        .then((result) => {
            if(result == "user_not_found")
            res.status(200).send(response.failure("user_not_found","User does not exist"));
        else{ 
            res.status(200).send(response.success(result, "Removed Successfully"));
        }
        });
};
