const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const UserModel = require('./users.model');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var moment = require('moment');

mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;

const creditHistorySchema = new Schema({
    balanceAfter: Number,
    balanceBefore: Number,
    amount: Number,
    fromUserId: String,
    fromName: String,
    toUserId: String,
    toName: String,
    transactionType: String,
    transactionStatus: String,
    reference: String
    
}, {timestamps: true});

creditHistorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
creditHistorySchema.set('toJSON', {
    virtuals: true
});

const userCreditHistory = mongoose.model('UserCreditHistory', creditHistorySchema);

creditHistorySchema.findById = function (cb) {
    return this.model('UserCreditHistory').find({id: this.id}, cb);
};

exports.addNewTransaction = (transaction)=> {
    console.log("transaction", transaction);
    return new Promise( function (resolve, reject )  {
    trx = new userCreditHistory(transaction);
    trx.save(function (error, result){
        console.log("result", result);
        result.status = true;
        resolve(result);
        });
  });
};

exports.getLogs = (req)=>{
    var userId = req.params.userId;
    var status = req.query.status;

    return new Promise( (resolve, reject)=> {
        const UserCreditHistory = mongoose.model('UserCreditHistory');
        if(status != undefined){
            UserCreditHistory.find ({"toUserId" : userId, "status": status}, function( err, result ){
                resolve(result);
            });
        }else{
            UserCreditHistory.find ({"toUserId" : userId}, function( err, result ){
                resolve(result);
            });
        }


    });

};
