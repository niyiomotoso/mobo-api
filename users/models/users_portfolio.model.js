const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const UserModel = require('./users.model');
const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
var moment = require('moment');

mongoose.connect(config.MONGO_URL);
const Schema = mongoose.Schema;

const userPortfolioSchema = new Schema({
    userId: String,
    balance: Number,
    partners: Array,
    referrals: Array
    
}, {timestamps: true});

userPortfolioSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userPortfolioSchema.set('toJSON', {
    virtuals: true
});

userPortfolioSchema.findById = function (cb) {
    return this.model('UserPortfolio').find({id: this.id}, cb);
};

const userPortfolio = mongoose.model('UserPortfolio', userPortfolioSchema);

exports.getUserWalletBalance = (userId) => {

    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if(result == null || result.length == 0)
        resolve(null);
        else{
          //  return result;
            userPortfolio.findOne({userId: userId}, function(err, wallet_details) {
                if(wallet_details == null ){
                    var walletData = {'userId': userId, 'balance': 0.00, referrals: [], partners: []};
                    const userW = new userPortfolio(walletData);
                     userW.save(function (err, result){
                         resolve(result.balance)
                     });
                     
                }else{
                resolve(wallet_details.balance); 
             }
                
            });
        }
       
    });

    });
     
};

exports.createNewAccount = (userId) =>{
        return new Promise  ((resolve, reject) => {
            var walletData = {'userId': userId, 'balance': 0.00, referrals: [], partners: []};
            const userW = new userPortfolio(walletData);
             userW.save(function (err, result){   
                 resolve(result);
             });
            });
};


exports.addToUserReferrals = (userId, Data, newUserId ) => {
    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if(result.length == 0)
        resolve("user_not_exist"); 
        else{
          //  return result;
            userPortfolio.findOne({userId: userId}, function(err, portfolio_details) {
                console.log("user id",userId );
                console.log("portfolio_details id",portfolio_details );
                var currentRefs = portfolio_details.referrals;
                let ids = Data.phones;
                var idVerificationPromise = new Promise((resolve, reject) => {
                    ids.forEach((element, index, array) => {
                      
                        let obj = currentRefs.find(o => o.phone  == element);

                        if(obj == undefined){
                            //make sure referral is getting for the first time

                            UserModel.findByPhone(element).then((result) => {
                            if(result != undefined || result != null){
                                
                                currentRefs.push({"phone": element, "status": "SIGNED_UP", });
                                
                            }
                            if (index === array.length -1) resolve();

                            });
                        }else{
                            if (index === array.length -1) resolve();
                            
                        }

                        
                    });
                });

  
                idVerificationPromise.then(() => {

                    var updateObject = {'referrals': currentRefs}; // {last_name : "smith", age: 44}   
                 
                    userPortfolio.update({userId  : userId}, {$set: updateObject},
                          function (err, result){
                            
                            userPortfolio.findOne({userId: userId}, function(err, result){
                                idArray = [];

                                result.referrals.forEach( (element, index)=> {
                                    idArray.push(element.phone);    
                                });

                            resolve(getUserDetailsFromArray('phone', idArray));
                           }); 
                          
                          });
                });

                      
          
            });
        }
       
    });

    });
};


exports.confirmUserReferrals = (userId, Data, newUserId ) => {
    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if(result.length == 0)
        resolve("user_not_exist"); 
        else{
          //  return result;
            userPortfolio.findOne({userId: userId}, function(err, portfolio_details) {
                console.log("user id",userId );
                console.log("portfolio_details id",portfolio_details );
                var currentRefs = portfolio_details.referrals;
                let ids = Data.phones;
                var idVerificationPromise = new Promise((resolve, reject) => {
                    ids.forEach((element, index, array) => {
                      
                        let obj = currentRefs.find(o => o.phone  == element);

                        if(obj == undefined){
                            //make sure referral is getting for the first time

                            UserModel.findByPhone(element).then((result) => {
                            if(result != undefined || result != null){
                                
                                currentRefs.push({"phone": element, "status": "SIGNED_UP", userId: newUserId });
                                
                            }
                            if (index === array.length -1) resolve();

                            });
                        }else{
                            if (index === array.length -1) resolve();
                            
                        }

                        
                    });
                });

  
                idVerificationPromise.then(() => {

                    var updateObject = {'referrals': currentRefs}; // {last_name : "smith", age: 44}   
                 
                    userPortfolio.update({userId  : userId}, {$set: updateObject},
                          function (err, result){
                            
                            userPortfolio.findOne({userId: userId}, function(err, result){
                                idArray = [];

                                result.referrals.forEach( (element, index)=> {
                                    idArray.push(element.phone);    
                                });

                            resolve(getUserDetailsFromArray('phone', idArray));
                           }); 
                          
                          });
                });

                      
          
            });
        }
       
    });

    });
};

exports.addToUserPartners = (userId, partnerData ) => {
    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if(result == null || result.length == 0)
        resolve("user_not_exist"); 
        else{
            var user_fullname = result.firstName+ " "+result.lastName;

            userPortfolio.findOne({userId: userId}, function(err, portfolio_details) {
            
                var currentPartners = portfolio_details.partners;
                let ids = partnerData.phones;
                var idVerificationPromise = new Promise((resolve, reject) => {
                    ids.forEach((element, index, array) => {
                      
                        let obj = currentPartners.find(o => o.phone  == element);
                       
                        if(obj == undefined){
                             //that is, phone is not been added before
                            UserModel.findByPhone(element).then((result) => {
                                //to ensure the user already exist
                            if(result != undefined || result != null){
                                
                                console.log("just added",element );  
                                var dateTime =  Date.now();
                                dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

                                currentPartners.push({ "userId": result._id, "phone": element, "status": 0, "createdAt": dateTime});
                                
                                //commonEmitter.emit('new_financial_partner_sms_event', element, user_fullname);

                               console.log(" dobe done done",element,  user_fullname);




                            }
                            if (index === array.length -1) resolve();

                            });
                        }else{
                            if (index === array.length -1) resolve();
                            
                        }

                        
                    });
                });

  
                idVerificationPromise.then(() => {

                    var updateObject = {'partners': currentPartners}; // {last_name : "smith", age: 44}   
                 
                    userPortfolio.update({userId  : userId}, {$set: updateObject},
                          function (err, result){
                            
                            userPortfolio.findOne({userId: userId}, function(err, result){
                                idArray = [];
                                result.partners.forEach( (element, index)=> {
                                    idArray.push(element.phone);    
                                });
                                resolve(getUserDetailsFromArray('phone', idArray));
                           }); 
                          
                          });
                });

                      
          
            });
        }
       
    });

    });
};


exports.removeFromUserPartners = (userId, partnerData ) => {
    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if( result == null || result.length == 0)
        resolve("user_not_exist"); 
        else{
        
            userPortfolio.findOne({userId: userId}, function(err, portfolio_details) {
            
                var currentPartners = portfolio_details.partners;
                let ids = partnerData.phones;
                var idVerificationPromise = new Promise((resolve, reject) => {
                    ids.forEach((element, index, array) => {
                      
                        let obj = currentPartners.find(o => o.phone  == element);

                        if(obj != undefined ){

                            currentPartners.splice(currentPartners.indexOf(obj), 1);
                            console.log("just removed",obj );
                           // UserModel.findByUserId(element).then((result) => {
                            // if(result != undefined || result != null){
                                
                            //     currentPartners.push({"userId": element, "status": 0});
                            //     console.log("just added",element );
                            // }
                            if (index === array.length -1) resolve();

                            //});
                        }else{
                            if (index === array.length -1) resolve();
                            
                        }

                        
                    });
                });

  
                idVerificationPromise.then(() => {

                    var updateObject = {'partners': currentPartners}; // {last_name : "smith", age: 44}   
                 
                    userPortfolio.update({userId  : userId}, {$set: updateObject},
                          function (err, result){
                            
                            userPortfolio.findOne({userId: userId}, function(err, result){
                                idArray = [];
                                result.partners.forEach( (element, index)=> {
                                    idArray.push(element.phone);    
                                });
                            resolve(getUserDetailsFromArray('phone', idArray));
                           }); 
                          
                          });
                });

                      
          
            });
        }
       
    });

    });
};

function getUserDetailsFromArray(field_to_search, fieldArray){
    
    return new Promise((resolve, reject) => {
            const Users = mongoose.model('Users');
            userDArray = [];    
            field_to_search = field_to_search.toString();     
            Users.find({ 'phone' : { $in: fieldArray } }, 'firstName lastName phone'  )
             .exec(function(err, userDArray) {
                resolve(userDArray);
            });
           
    });
}

function getUserPortfolioDetailsFromArray(field_to_search, fieldArray){
    
    return new Promise((resolve, reject) => {
            const UserPortfolio = mongoose.model('UserPortfolio');
            userDArray = [];    
            field_to_search = field_to_search.toString();     
            UserPortfolio.find({ 'userId' : { $in: fieldArray } }, 'userId balance'  )
             .exec(function(err, userDArray) {
                resolve(userDArray);
            });
           
    });
}

exports.getUserReferrals  = (userId)=>{
 return new Promise ((resolve, reject) =>{
    userPortfolio.findOne({userId: userId}, function(err, result){
        idArray = [];
        if(result !=null){
        result.referrals.forEach( (element, index)=> {
            idArray.push(element.phone);    
        });
      }
        resolve(getUserDetailsFromArray('phone', idArray));
   }); 
 });
}

exports.getUserPartners  = (userId)=>{
    return new Promise ((resolve, reject) =>{
       userPortfolio.findOne({userId: userId}, function(err, result){
           idArray = [];
           if(result !=null){
           result.partners.forEach( (element, index)=> {
               idArray.push(element.phone);    
           });
        }
       resolve(getUserDetailsFromArray('phone', idArray));
      }); 
    });
   }

   exports.getUserPartnersWalletDetails  = (userId)=>{
    return new Promise ((resolve, reject) =>{
       userPortfolio.findOne({userId: userId}, function(err, result){
           idArray = [];
           if(result !=null){
           result.partners.forEach( (element, index)=> {
               idArray.push(element.userId);    
           });
        }
       resolve(getUserPortfolioDetailsFromArray('userId', idArray));
      }); 
    });
   }

exports.findById = (id) => {
    return userPortfolio.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};





