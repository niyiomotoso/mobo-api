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
mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;

const leappaymentSessionSchema = new Schema({
    userId: String,
    status:String,
    transactionType: String,
    amount: String,
    reference: String,
    transactionId: String,
    depositorName: String,
    paymentDate: String

}, {timestamps: true});

leappaymentSessionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
leappaymentSessionSchema.set('toJSON', {
    virtuals: true
});

leappaymentSessionSchema.findById = function (cb) {
    return this.model('leappaymentSession').find({id: this.id}, cb);
};

const leappaymentSession = mongoose.model('leappaymentSession', leappaymentSessionSchema);

exports.logPayment = (leappaymentData) => {
    var userId = leappaymentData.userId;
    var reference = leappaymentData.reference;
    var transactionId = leappaymentData.transactionId;
    var depositorName = leappaymentData.depositorName;
    var transactionType = leappaymentData.transactionType;
    var amount = leappaymentData.amount;
    var status = leappaymentData.status;

    return new Promise( (resolve, reject)=> {
        var dateTime =  Date.now();
        var paymentDate = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
        let session = {"userId": userId, "reference": reference, "amount": amount, "status": status, "transactionType": transactionType, "transactionId":transactionId, "paymentDate" : paymentDate, "depositorName" : depositorName};
        const leappayment = new leappaymentSession(session);
        leappayment.save(
                function(err, savedSession){  
                       console.log("else", savedSession);
                            resolve(savedSession);
                        });
    });
};


exports.updateManualTransferPayment = (leappaymentData) => {
    var leappaymentId = leappaymentData.leappaymentId;
    var status = leappaymentData.status;

    const leappayment = mongoose.model('leappaymentSession');

    return new Promise( (resolve, reject)=> {
        leappayment.findOne ( {_id: leappaymentId}, function( err, data ){
       if( data == undefined || data == null ){
            resolve('leappayment_not_found'); 
       }else if(data.status == "APPROVED"){
        resolve('leappayment_already_approved'); 
       }else if(data.status == "DISAPPROVED"){
        resolve('leappayment_already_disapproved'); 
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
                leappayment.updateOne({ _id : data._id}, {$set: updateObject},
                function (err, result){

                    if(result.nModified == 1){     
                        resolve(outcome); 
                    }

                });   

                });
           }else{
            var updateObject = {"status": "DISAPPROVED"}; 
            //console.log("savedSession", savedSession);
            leappayment.updateOne({ _id : data._id}, {$set: updateObject},
            function (err, result){

                leappayment.findOne ( {_id: leappaymentId}, function( err, updated_leappayment ){
                    resolve(updated_leappayment); 
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
        const leappaymentSession = mongoose.model('leappaymentSession');
        if(status != undefined){
            leappaymentSession.find ({"userId" : userId, "status": status}, function( err, result ){
                resolve(result);
            });
        }else{
            leappaymentSession.find ({"userId" : userId}, function( err, result ){
                resolve(result);
            });
        }


    });

};








