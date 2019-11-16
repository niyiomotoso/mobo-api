const LoanModel = require('../models/loan.model');
const response = require('../../common/jsonResponse');



exports.getMaximumLoan = (req, res) => {
    LoanModel.getMaximumLoan(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};

exports.getUserLoans = (req, res) => {
    LoanModel.getUserLoans(req)
        .then((result) => {
            LoanModel.getMaximumLoan(req.params.userId)
        .then((result_2) => {
            res.status(200).send(response.success({"maximumLoanAmount": result_2, "loans": result }, "Loaded Successfully"));
        
        });
    });
};

exports.updateLoanStatus = (req, res) => {

    if(req.params.loanId == undefined   ){
        res.status(200).send(response.failure("loanid_not_set", "no loanId set"));
    }

    LoanModel.updateLoanStatus(req.params.loanId, req.body.status)
        .then((result) => {
            
            if(result == 'loan_id_not_found'){
                res.status(200).send(response.failure("loan_not_found", "loan session not found"));
            }else if(result == 'invalid_status'){
                res.status(200).send(response.failure("invalid_status", "invalid status"));
            }else{
                res.status(200).send(response.success(result, "Updated Successfully"));
            }
           
        });
};

exports.addVouchToLoan = (req, res) => {
    if(req.body.amount == undefined || req.body.loanId  == undefined  || req.body.partnerUserId  == undefined  ){
        res.status(200).send(response.failure("incompelete_params", "incomplete parameter set"));
    }
    else{
    LoanModel.addVouchToLoan(req.body)
        .then((result) => {
            if(result == 'loan_id_not_found'){
                res.status(200).send(response.failure("loan_not_found", "loan session not found"));
            }else if(result == 'financial_partner_not_found'){
                res.status(200).send(response.failure("financial_partner_not_found", "financial partner not found"));
            }
            else if(result == 'requested_amount_exceeded'){
                res.status(200).send(response.failure("requested_amount_exceeded", "requested amount exceeded by new vouch"));
            }
            else if(result == 'vouch_amount_more_than_balance'){
                res.status(200).send(response.failure("vouch_amount_more_than_balance", "Vouch amount should be less than your current balance"));
            }
            
            
            else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        
        });
    }
};

exports.paybackLoan = (req, res) => {
    if(req.body.amount == undefined || req.body.loanId  == undefined ){
        res.status(200).send(response.failure("incompelete_params", "incomplete parameter set"));
    }
    else{
    LoanModel.paybackLoan(req.body)
        .then((result) => {
            if(result == 'loan_id_not_found'){
                res.status(200).send(response.failure("loan_not_found", "loan session not found"));
            }else if(result == 'user_not_found'){
                res.status(200).send(response.failure("user_not_found", "user not found"));
            }
            else if(result == 'requested_amount_exceeded'){
                res.status(200).send(response.failure("requested_amount_exceeded", "requested amount exceeded by new payback"));
            }
            else if(result == 'amount_more_than_balance'){
                res.status(200).send(response.failure("amount_more_than_balance", "Payback amount should be less than your current balance"));
            }
            
            
            else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        
        });
    }
};

exports.makeLoanRequest = (req, res) => {
    if(req.body.userId == undefined || req.body.amountRequested  == undefined   ){
        res.status(200).send(response.failure("incomplete_params", "incomplete parameter set"));
    }
    else if( req.body.amountRequested  <  5  ){
        res.status(200).send(response.failure("invalid_amount", "invalid amount"));
    }
    else{    
        LoanModel.makeLoanRequest(req.body)
            .then((result) => {
                
                if(result == 'one_active_loan'){
                    res.status(200).send(response.failure("one_active_loan", "You still have an active loan"));
                }else if(result == 'user_not_found'){
                    res.status(200).send(response.failure("user_not_found", "User not found"));
                }
                else if(result == 'limit_exceeded'){
                    res.status(200).send(response.failure("limit_exceeded", "loan limit exceeded"));
                }
                else{
                res.status(200).send(response.success(result, "Loaded Successfully"));
            }
            
            });
    }
};
