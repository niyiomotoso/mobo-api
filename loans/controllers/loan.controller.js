const LoanModel = require('../models/loan.model');
const response = require('../../common/jsonResponse');



exports.getMaximumLoan = (req, res) => {
    LoanModel.getMaximumLoan(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};

exports.getUserLoans = (req, res) => {
    LoanModel.getUserLoans(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};


exports.addVouchToLoan = (req, res) => {
    LoanModel.addVouchToLoan(req.body)
        .then((result) => {
            if(result == 'loan_id_not_found'){
                res.status(200).send(response.failure( "loan session not found"));
            }else if(result == 'financial_partner_not_found'){
                res.status(200).send(response.failure( "financial partner not found"));
            }
            else if(result == 'requested_amount_exceeded'){
                res.status(200).send(response.failure( "requested amount exceeded by new vouch"));
            }
            
            else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        
        });
};

exports.makeLoanRequest = (req, res) => {
    LoanModel.makeLoanRequest(req.body)
        .then((result) => {
            if(result == 'limit_exceeded'){
                res.status(200).send(response.failure( "loan limit exceeded"));
            }
            else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        
        });
};
