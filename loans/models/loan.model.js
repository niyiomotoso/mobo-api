const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');

const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
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
            UserPortfolioModel.getUserPartnersWalletDetails(userId)
            .then((user_partners) => {
                var totalAvailable = 0;
                
                user_partners.forEach(element => {
                totalAvailable = totalAvailable + parseFloat(element.balance);

                });

                resolve(totalAvailable);
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
     var maximumAllowed =  this.getMaximumLoan(userId);

    const loan = new loanSession(session);
    if( parseFloat(maximumAllowed) < parseFloat(amountRequested) ){
        return 'limit_exceeded';
    }else{
    return new Promise ( ( resolve, reject) => {
        loan.save(
            function(err, savedSession){
                resolve(savedSession);
            }
        );
        }
    )
}
};


exports.getUserLoans = (userId)=>{
    return new Promise( (resolve, reject)=> {
        loanSession.find ({"userId" : userId}, function( err, result ){
            resolve(result);
        });
    });

};

exports.addVouchToLoan = (vouchData)=>{
    return new Promise( (resolve, reject)=> {
        var loanId = vouchData.loanId;
        var partnerUserId = vouchData.partnerUserId;
        var amount = vouchData.amount;

        const Users = mongoose.model('Users');

        Users.findOne ({ _id : partnerUserId}, function( err, result ){
            if( result == undefined || result == null ){
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
                   vouches.push({ "userId": partnerUserId, "amount": amount, "status": 1, "createdAt": dateTime});                   
                }else{
                    var totalVouchAmount =  totalVouchAmountAfterNewVouch;
                    vouches.push({ "userId": partnerUserId, "amount": amount, "status": 1, "createdAt": dateTime});     
                                           
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







