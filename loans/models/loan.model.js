const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');

const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
mongoose.connect(config.MONGO_URL);
const Schema = mongoose.Schema;

const loanSessionSchema = new Schema({
    userId: String,
    amountRequested: Number,
    totalVouchAmount: Number,
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
                resolve(totalAvailable);
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
    var userPaybackTime = "";
    var systemPaybackTime =  "";
    var status =  'ACTIVE';
    var vouches = [];
    var payBacks = [];
    let session = {"userId": userId, "amountRequested": amountRequested, "totalVouchAmount":
        totalVouchAmount, "userPaybackTime" : userPaybackTime, "systemPaybackTime": systemPaybackTime,
        "status": status, "vouches": vouches, "payBacks": payBacks
     };

     const users = mongoose.model('Users');
     let parent = this;
     return new Promise( (resolve, reject)=> {
       users.findOne ( {_id: userId}, function( err, portfolio ){
        if( portfolio == undefined || portfolio == null ){
             resolve('user_not_found'); 
        }else{
             parent.getMaximumLoan(userId).then( (maximumAllowed)=>{    
                const loan = new loanSession(session);
                console.log(parseFloat(maximumAllowed), parseFloat(amountRequested) );
            
                if( parseFloat(maximumAllowed) < parseFloat(amountRequested) ){
                    resolve('limit_exceeded');
                }else {                  
                        loanSession.find ({"status" : "ACTIVE", "userId": userId}, function( err, result ){
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
    }
    });
    });

};

exports.updateLoanStatus = (loanId, status)=>{
    return new Promise( (resolve, reject)=> {
       
        loanSession.findOne ({_id : loanId}, function( err, loanData ){
            if( loanData == undefined || loanData == null )
              resolve('loan_id_not_found');
            else if(status == "ACCEPTED" || status == "CANCELED" ){
           
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







