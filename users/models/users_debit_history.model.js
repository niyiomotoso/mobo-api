const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const UserModel = require('./users.model');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var moment = require('moment');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;

const debitHistorySchema = new Schema({
    balanceAfter: Number,
    balanceBefore: Number,
    amount: Number,
    fromUserId: String,
    fromName: String,
    toUserId: String,
    toName: String,
    transactionType: String,
    transactionStatus: String,
    
}, {timestamps: true});

debitHistorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
debitHistorySchema.set('toJSON', {
    virtuals: true
});

const userDebitHistory = mongoose.model('UserDebitHistory', debitHistorySchema);

debitHistorySchema.findById = function (cb) {
    return this.model('UserDebitHistory').find({id: this.id}, cb);
};

exports.addNewTransaction = (transaction)=> {
    return new Promise( function (resolve, reject )  {
    trx = new userDebitHistory(transaction);
    trx.save(function (error, result){
        resolve(result);
        });
  });
};
