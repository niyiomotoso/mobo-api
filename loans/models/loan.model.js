const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');

const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;
var debitHistory = require("../../users/models/users_debit_history.model")


const loanSessionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,                             
        ref: 'Users'
      },
    amountRequested: Number,
    totalVouchAmount: Number,
    totalPaybackAmount: Number,
    userPaybackTime: String,
    systemPaybackTime: String,
    status: String,
    vouches: Array,
    payBacks: Array
    
}, {timestamps: true});

loanSessionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
loanSessionSchema.set('toJSON', {
    virtuals: true
});

loanSessionSchema.findById = function (cb) {
    return this.model('loanSession').find({id: this.id}, cb);
};

const loanSession = mongoose.model('loanSession', loanSessionSchema);

exports.getMaximumLoan = (userId) => {

    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
        if(result == null || result.length == 0)
        resolve(null);
        else{   

            UserPortfolioModel.getUserWalletBalance(userId)
            .then((balance) => {   
                console.log( "balance", balance);   
                if(balance == null){
                    balance = 0;
                }
            UserPortfolioModel.getUserPartnersWalletDetails(userId)
            .then((user_partners) => {
                var totalAvailable = 0;
                user_partners.forEach(element => {
                totalAvailable = totalAvailable + parseFloat(element.balance);

                });
                totalAvailable = totalAvailable + parseFloat(balance);
                
                loanSession.find ({"userId" : userId, "status": { $ne:  "REDEEMED" }  }, function( err, loan ){
                    console.log("REDEEMED", loan);
                //let loanData = {"maximumLoanAmount": totalAvailable, "currentActiveLoan": loan}
                let loanData = {"maximumLoanAmount": 100000, "currentActiveLoan": loan}
                resolve(loanData);
            });
        });
        });
        }
       
    });

    });
     
};

exports.makeLoanRequest = (loanData)=> {
    var userId=  loanData.userId;
    var amountRequested =  loanData.amountRequested;
    var totalVouchAmount  = 0;
    var totalPaybackAmount  = 0;
    var userPaybackTime = "";
    var systemPaybackTime =  "";
    var status =  'PENDING';
    var vouches = [];
    var payBacks = [];
    let session = {"userId": userId, "amountRequested": amountRequested, "totalVouchAmount": totalVouchAmount, 
    "totalPaybackAmount":totalPaybackAmount, "userPaybackTime" : userPaybackTime, "systemPaybackTime": systemPaybackTime,
        "status": status, "vouches": vouches, "payBacks": payBacks
     };

     const users = mongoose.model('Users');
     let parent = this;
     return new Promise( (resolve, reject)=> {
       users.findOne ( {_id: userId}, function( err, portfolio ){
        if( portfolio == undefined || portfolio == null ){
             resolve('user_not_found'); 
        }else{
             parent.getMaximumLoan(userId).then( (loanData)=>{    
                const loan = new loanSession(session);
                console.log(parseFloat(loanData.maximumLoanAmount), parseFloat(amountRequested) );
            
                if( parseFloat(loanData.maximumLoanAmount) < parseFloat(amountRequested) ){
                    resolve('limit_exceeded');
                }else {                  
                        loanSession.find ({ "status": { $ne: "REDEEMED" } , "userId": userId}, function( err, result ){
                            if(result.length >= 1){
                                resolve("one_active_loan");
                            }else{
                                loan.save(
                                    function(err, savedSession){     
                                        commonEmitter.emit('new_loan_request_sms_event', userId, amountRequested);
                                        resolve(savedSession);
                                    }
                                    )
                            }                 
                        });
                    }
            
            });
        }
        });
    });

};

exports.getUserLoans = (req)=>{
    console.log(req);
   var userId = req.params.userId;
   var status = req.query.status;

   if(status != undefined){
    return new Promise( (resolve, reject)=> {
     
        loanSession.find ({"userId" : userId, "status": status}, function( err, result ){
            resolve(result);
        });
    });

   }else{
        return new Promise( (resolve, reject)=> {
         
            loanSession.find ({"userId" : userId}, function( err, result ){
                resolve(result);
            });
        });
    }
};


exports.addVouchToLoan = (vouchData)=>{
    return new Promise( (resolve, reject)=> {
        var loanId = vouchData.loanId;
        var partnerUserId = vouchData.partnerUserId;
        var amount = vouchData.amount;

        const Users = mongoose.model('Users');

        Users.findOne ({ _id : partnerUserId}, function( err, partneruser ){
            if( partneruser == undefined || partneruser == null ){
                resolve('financial_partner_not_found');
                
            }
       else{
        const UserPortfolio = mongoose.model('UserPortfolio');
        UserPortfolio.findOne ({ userId : partnerUserId}, function( err, portfolio ){
            if( portfolio != null ){
                var balance = parseFloat(portfolio.balance );
                if( balance < parseFloat( amount) )
                resolve('vouch_amount_more_than_balance'); 
            }

        loanSession.findOne ({_id : loanId}, function( err, loanData ){
            if( loanData == undefined || loanData == null )
              resolve('loan_id_not_found');
            else{
 
            let vouches = loanData.vouches;
           
            var dateTime =  Date.now();
            dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
            

            var totalVouchAmountAfterNewVouch =  parseFloat(loanData.totalVouchAmount) + parseFloat( amount);
            
            if(totalVouchAmountAfterNewVouch > parseFloat(loanData.amountRequested) ){
                resolve('requested_amount_exceeded');
            }
            else{
                let obj = vouches.find(o => o.userId  == partnerUserId);

                if(obj != undefined ){
                  //if already exist, removed the current from the newly added
                   vouches.splice(vouches.indexOf(obj), 1);
                  
                   var totalVouchAmount =  totalVouchAmountAfterNewVouch - parseFloat(obj.amount);
                   vouches.push({ "userId": partnerUserId, "amount": amount, "status": 1, "createdAt": dateTime, 'name':partneruser.firstName+" "+partneruser.lastName });                   
                }else{
                    var totalVouchAmount =  totalVouchAmountAfterNewVouch;
                    vouches.push({ "userId": partnerUserId, "amount": amount, "status": 1, "createdAt": dateTime,  'name':partneruser.firstName+" "+partneruser.lastName});     
                                           
                }

            var updateObject = {'vouches': vouches, 'totalVouchAmount': totalVouchAmount}; 

            loanSession.update({ _id  : loanId}, {$set: updateObject},
                function (err, result){
                    if(result){     
                        loanSession.findOne({_id : loanId}, function(err, result){     
                        resolve({ "loanId": loanId, "amountRequested": result.amountRequested, "totalVouchAmount": result.totalVouchAmount});
                    }); 
                }
                          
                });

            }
     
            }
        });
        });
    }
    });
    });

};


exports.paybackLoan = (paybackData)=>{
    return new Promise( (resolve, reject)=> {
        var loanId = paybackData.loanId;
        var amount = paybackData.amount;

        const Users = mongoose.model('Users');

        loanSession.findOne ({_id : loanId}, function( err, loanData ){
            if( loanData == undefined || loanData == null )
              resolve('loan_id_not_found');
            else{
        var userId = loanData.userId;
        const UserPortfolio = mongoose.model('UserPortfolio');
        UserPortfolio.findOne ({ userId : userId}, function( err, portfolio ){
            if( portfolio != null ){
                var balance = parseFloat(portfolio.balance );
                if( balance < parseFloat( amount) ){
                 resolve('amount_more_than_balance'); 
                }
            }else{
                resolve('user_not_found'); 
            }

            Users.findOne ({ _id : userId}, function( err, partneruser ){
                if( partneruser == undefined || partneruser == null ){
                    resolve('user_not_found');
                    
                }
           else{
            let payBacks = loanData.payBacks;
           
            var dateTime =  Date.now();
            dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
            
            if(loanData.totalPaybackAmount == undefined )
                loanData.totalPaybackAmount = 0;

            var totalVouchAmountAfterNewPayback =  parseFloat(loanData.totalPaybackAmount) + parseFloat( amount);
            console.log("totalVouchAmountAfterNewPayback", totalVouchAmountAfterNewPayback);
            if(totalVouchAmountAfterNewPayback > parseFloat(loanData.amountRequested) ){
                resolve('requested_amount_exceeded');
            }
            else{
                var totalPaybackAmount =  totalVouchAmountAfterNewPayback;
                payBacks.push({ "userId": userId, "amount": amount, "status": 'PAID', "createdAt": dateTime,  'name':partneruser.firstName+" "+partneruser.lastName});     
                                           
            var balanceLeft =  parseFloat( portfolio.balance) -  parseFloat(amount);
            var balanceObject = {'balance': balanceLeft}; 
            
                var updateObject = {'payBacks': payBacks, 'totalPaybackAmount': totalPaybackAmount}; 
                if(totalPaybackAmount >=   parseFloat(loanData.amountRequested) ){
                    updateObject.status = "REDEEMED";
                }

                UserPortfolio.update ( { userId : userId },{$set: balanceObject},  function( err, res ){
                    if( res){
                    loanSession.update({ _id  : loanId}, {$set: updateObject},
                    function (err, result){
                        console.log("result", result);
                        if(result){     
                            loanSession.findOne({_id : loanId}, function(err, result){ 
                                
                                var transaction =  {"balanceAfter": balanceLeft,
                                    "balanceBefore": portfolio.balance,
                                    "amount": parseFloat(amount).toFixed(2),
                                    "fromUserId" : userId,
                                    "fromName" : partneruser.firstName+" "+partneruser.lastName,
                                    "toUserId" : "LEAP",
                                    "toName" : "LEAP",
                                    "transactionType" : "LOAN PAYBACK",
                                    "transactionStatus" : "DONE" };
                  
                                    debitHistory.addNewTransaction(transaction);

                            resolve({ "loanId": loanId, "amountRequested": result.amountRequested, "totalPaybackAmount": result.totalPaybackAmount});
                        }); 
                    }
                            
                    });
                }
                });
            }
            }
        });
        });
    }
    });
    });

};


exports.updateLoanStatus = (loanId, status)=>{
    return new Promise( (resolve, reject)=> {
       
        loanSession.findOne ({_id : loanId}, function( err, loanData ){
            if( loanData == undefined || loanData == null )
              resolve('loan_id_not_found');
            else if(status == "ACCEPTED" || status == "CANCELED" || status == "PAID" ){
           
                var updateObject = {'status': status};  
                loanSession.updateOne({ _id  : loanId}, {$set: updateObject},
                    function (err, result){
                        if(result){     
                            loanSession.findOne({_id : loanId}, function(err, result){     
                            resolve(result);
                        }); 
                    }
                            
                    });

            }
            else{
            resolve('invalid_status');
        }
      
    });
  
});
};


exports.getUserPartnerLoans  = (userId)=>{

    return new Promise ((resolve, reject) =>{
    const userPortfolio = mongoose.model('UserPortfolio');
       userPortfolio.findOne({userId: userId}, function(err, result){
           idArray = [];
           if(result ==null){
            resolve('user_not_found'); 
           }
           else{
           result.partners.forEach( (element, index)=> {
               console.log(element.userId);
               idArray.push(  element.userId );    
           });
           console.log(idArray);
            const loans = mongoose.model("loanSession");
            loans.aggregate([
                                
                                {
                                  $match:{"userId": { "$in": idArray },
                                  }
                                },
                               
                                {
                                   $lookup:
                                   {
                                       from: "users",
                                       localField: "userId",
                                       foreignField: "_id",
                                       as: "owner"
                                   }
                                }
                                ,
                                {$unwind: '$owner'}
                               
                                ]).exec().then((data) => {
                                    console.log("data",data);
                                    resolve(data);
                                  }).catch((err) => {
                                    console.error("err",err);
                                  });


        }
       
      }); 


    });


   }




