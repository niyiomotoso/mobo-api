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

exports.updateLoanStatus = (req, res) => {

    if(req.params.loanId == undefined   ){
        res.status(200).send(response.failure( "no loanId set"));
    }

    LoanModel.updateLoanStatus(req.params.loanId, req.body.status)
        .then((result) => {
            
            if(result == 'loan_id_not_found'){
                res.status(200).send(response.failure( "loan session not found"));
            }else if(result == 'invalid_status'){
                res.status(200).send(response.failure( "invalid status"));
            }else{
                res.status(200).send(response.success(result, "Updated Successfully"));
            }
           
        });
};


exports.addVouchToLoan = (req, res) => {
    if(req.body.amount == undefined || req.body.loanId  == undefined  || req.body.partnerUserId  == undefined  ){
        res.status(200).send(response.failure( "incomplete parameter set"));
    }
    else{
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
    }
};

exports.makeLoanRequest = (req, res) => {
    if(req.body.userId == undefined || req.body.amountRequested  == undefined   ){
        res.status(200).send(response.failure( "incomplete parameter set"));
    }
    else{    
        LoanModel.makeLoanRequest(req.body)
            .then((result) => {
                if(result == 'limit_exceeded'){
                    res.status(200).send(response.failure( "loan limit exceeded"));
                }
                else{
                res.status(200).send(response.success(result, "Loaded Successfully"));
            }
            
            });
    }
};
