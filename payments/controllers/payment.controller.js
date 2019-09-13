const PaymentModel = require('../models/payment.model');
const response = require('../../common/jsonResponse');



// exports.getMaximumPayment = (req, res) => {
//     PaymentModel.getMaximumPayment(req.params.userId)
//         .then((result) => {
//             res.status(200).send(response.success(result, "Loaded Successfully"));
        
//         });
// };

exports.logPaystackPayment = (req, res) => {
    if(req.body.userId == undefined || req.body.reference == undefined || req.body.amount == undefined ){
        res.status(200).send(response.failure("incomplete_params", "incomplete parameter set"));
    }
    
    PaymentModel.logPaystackPayment(req.body)
        .then((result) => {
            console.log("result", result);
            if(result == 'existing_transaction'){
                res.status(200).send(response.failure("error_processing_transaction", "transaction already processed"));
            }
            else if(result.status != undefined && result.status == false){
                res.status(200).send(response.failure("error_processing_transaction", result));
            }else if(result.transactionStatus != undefined && result.transactionStatus == "DONE"){
            res.status(200).send(response.success(result, "Loaded Successfully"));
            }else{
                res.status(200).send(response.failure("error_processing_transaction", result));
            }
        });
};

exports.getLogs = (req, res) => {
    PaymentModel.getLogs(req)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};



exports.addContributionToPayment = (req, res) => {
    if(req.body.amount == undefined || req.body.paymentId  == undefined  || req.body.contributorUserId  == undefined  ){
        res.status(200).send(response.failure("incomplete_params" ,"incomplete parameter set"));
    }
    else{
        PaymentModel.addContributionToPayment(req.body)
            .then((result) => {
                if(result == 'payment_id_not_found'){
                    res.status(200).send(response.failure("payment_not_found", "Payment session not found"));
                }else if(result == 'user_not_found'){
                    res.status(200).send(response.failure("user_not_found", "contributor not found"));
                }
                else if(result == 'requested_amount_exceeded'){
                    res.status(200).send(response.failure( "requested_amount_exceeded","requested amount exceeded by new contribution"));
                }
                else if(result == 'contributor_insufficient_balance'){
                    res.status(200).send(response.failure("contributor_insufficient_balance","insufficient balance in contributor account"));
                }
                
                
                else{
                res.status(200).send(response.success(result, "Loaded Successfully"));
            }
            
            });
    }
};

exports.makePaymentRequest = (req, res) => {

    if(req.body.userId == undefined || req.body.targetAmount  == undefined || req.body.targetMode == undefined){
        res.status(200).send(response.failure("incomplete_params", "incomplete parameter set"));
    }else if(req.body.targetMode == "TIME_TARGET" && req.body.targetTime == undefined){
        res.status(200).send(response.failure("time_target_not_set", "targetTime not set for TIME_TARGET mode"));
    }
    else if(req.body.targetMode != "TIME_TARGET"  && req.body.targetMode  != "MONEY_TARGET" && req.body.targetMode  != "ANYTIME"){
        res.status(200).send(response.failure("invalid_target_mode", "invalid target mode"));
    }
    else if(req.body.paymentType == undefined  ){
        res.status(200).send(response.failure("payment_type_not_set", "payment type not set"));
    }
    else if(req.body.paymentType  != "PRIVATE" && req.body.paymentType  != "PUBLIC"){
        res.status(200).send(response.failure("invalid_payment_type", "invalid payment type"));
    }
    else{
        if(req.body.paymentType  == "PUBLIC"){
            if( req.file == undefined || req.file.filename == undefined  || req.body.description == undefined ){
                res.status(200).send(response.failure("public_payment_params_not_set", "cover image and description must be set"));
            }else{
                req.body.coverImage = req.file.filename;
            }
        }
        PaymentModel.makePaymentRequest(req.body)
            .then((result) => {
                if(result == 'limit_exceeded'){
                    res.status(200).send(response.failure("limit_exceeded", "Payment limit exceeded"));
                }
                else{
                res.status(200).send(response.success(result, "Loaded Successfully"));
            }
            
            });
    }
};
