const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const https = require('https')
const request = require('request')
const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
mongoose.connect(config.MONGO_URL);
const Schema = mongoose.Schema;

const paymentSessionSchema = new Schema({
    userId: String,
    //PENDING e.t.c
    status:String,
    channel: String,
    amount: String,
    reference: String,
    paymentEvidence: String
}, {timestamps: true});

paymentSessionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
paymentSessionSchema.set('toJSON', {
    virtuals: true
});

paymentSessionSchema.findById = function (cb) {
    return this.model('paymentSession').find({id: this.id}, cb);
};

const paymentSession = mongoose.model('paymentSession', paymentSessionSchema);

exports.logPaystackPayment = (paymentData) => {
    var userId = paymentData.userId;
    var reference = paymentData.reference;
    var pending_amount = paymentData.amount;

    const users = mongoose.model('Users');
    return new Promise( (resolve, reject)=> {
      users.findOne ( {_id: userId}, function( err, userData ){
       if( userData == undefined || userData == null ){
            resolve('user_not_found'); 
       }else{
        const creditHistory = mongoose.model('UserCreditHistory');
        creditHistory.find({ reference: reference}, function(err, history){
            if(history.length > 0 ){
                resolve('existing_transaction');
            }else{
       
        let session = {"userId": userId, "reference": reference, "amount": pending_amount, "status": "PENDING", "channel": "PAYSTACK_ONLINE"};
        const payment = new paymentSession(session);
        payment.save(
                function(err, savedSession){  
        
                    const options = {
                    url: 'https://api.paystack.co/transaction/verify/'+reference,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'BEARER sk_test_a3444f7e4420ec600be5b0fec811136c5da8ebb1'
                      }
                    };

                    request(options, function(err, res, body) {
                        let json = JSON.parse(body);
                    
                        if(json.status == false){
                            resolve(json)
                        }
                        else if(json.status == true && json.data.status == "success"){
                            var amount = json.data.amount;
                            
                            var transaction =  {"amount": amount,
                                                        "fromUserId" : "-",
                                                        "fromName" : "PAYSTACK",
                                                        "toUserId" : userId,
                                                        "toName" : userData.firstName+" "+userData.lastName,
                                                        "transactionType" : "PAYSTACK",
                                                        "reference": reference
                                                        };

                           UserPortfolioModel.addToWalletBalance(userId, transaction)
                           .then(function(outcome){
                            //not working
                            const payment = mongoose.model('paymentSession');
                            
                            console.log("payment ", payment);
                            
                                var updateObject = {"status": "APPROVED"}; 
                                payment.updateOne({ _id:savedSession._id},{$set: updateObject},
                                    function (err, result){
                                        console.log("result", result);
                                        if(result.nModified == 1){     
                                            resolve(outcome); 
                                        }
        
                                    });         
                           });
                          
                        }
                        else{
                            console.log("else", json.status);
                            resolve(json);
                        }
                    });
                });
            }
         });
    }
     
}); });
};



exports.logManualTransferPayment = (paymentData) => {
    var userId = paymentData.userId;
    var pending_amount = paymentData.amount;

    const users = mongoose.model('Users');
    let parent = this;
    return new Promise( (resolve, reject)=> {
      users.findOne ( {_id: userId}, function( err, userData ){
       if( userData == undefined || userData == null ){
            resolve('user_not_found'); 
       }else{
        var d = new Date();
        var datetime = d.getTime();
        var paymentEvidence = '';
        if(paymentData.paymentEvidence != undefined){
            paymentEvidence = config.payment_image_path+paymentData.paymentEvidence;
        }

        let session = {"userId": userId, "reference": datetime, "amount": pending_amount, "status": "PENDING", "channel": "BANK_TRANSFER", "paymentEvidence":paymentEvidence };
        const payment = new paymentSession(session);
        payment.save(
                function(err, savedSession){  
                       console.log("else", savedSession);
                            resolve(savedSession);
                        });
                    }
                });
      
});
};


exports.updateManualTransferPayment = (paymentData) => {
    var paymentId = paymentData.paymentId;
    var status = paymentData.status;

    const payment = mongoose.model('paymentSession');

    return new Promise( (resolve, reject)=> {
        payment.findOne ( {_id: paymentId}, function( err, data ){
       if( data == undefined || data == null ){
            resolve('payment_not_found'); 
       }else if(data.status == "APPROVED"){
        resolve('payment_already_approved'); 
       }else if(data.status == "DISAPPROVED"){
        resolve('payment_already_disapproved'); 
       }else{
           if( status == 'APPROVED' ){
                var transaction =  {"amount": data.amount,
                "fromUserId" : "-",
                "fromName" : "LEAP_TRANSFER",
                "toUserId" : data.userId,
                "toName" : "",
                "transactionType" : "LEAP_TRANSFER",
                "reference": data.reference
                };

                UserPortfolioModel.addToWalletBalance(data.userId, transaction)
                .then(function(outcome){
        
                var updateObject = {"status": "APPROVED"}; 
                //console.log("savedSession", savedSession);
                payment.updateOne({ _id : data._id}, {$set: updateObject},
                function (err, result){

                    if(result.nModified == 1){     
                        resolve(outcome); 
                    }

                });   

                });
           }else{
            var updateObject = {"status": "DISAPPROVED"}; 
            //console.log("savedSession", savedSession);
            payment.updateOne({ _id : data._id}, {$set: updateObject},
            function (err, result){

                payment.findOne ( {_id: paymentId}, function( err, updated_payment ){
                    resolve(updated_payment); 
                });

            }); 

           }       
            }
            });
      
});
};



exports.getLogs = (req)=>{
    var userId = req.params.userId;
    var status = req.query.status;

    return new Promise( (resolve, reject)=> {
        const paymentSession = mongoose.model('paymentSession');
        if(status != undefined){
            paymentSession.find ({"userId" : userId, "status": status}, function( err, result ){
                resolve(result);
            });
        }else{
            paymentSession.find ({"userId" : userId}, function( err, result ){
                resolve(result);
            });
        }


    });

};








