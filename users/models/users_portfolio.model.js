const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const UserModel = require('./users.model');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var moment = require('moment');
var debitHistory = require("../models/users_debit_history.model")
var creditHistory = require("../models/users_credit_history.model")
mongoose.connect(process.env.MONGO_URL);
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
        resolve("user_not_found");
        else{
          //  return result;
            userPortfolio.findOne({userId: userId}, function(err, wallet_details) {
                console.log(wallet_details);
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


exports.removeFromWalletBalance = (userId, trxData) => {

    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if(result == null || result.length == 0)
        resolve("user_not_found");
        else{
          //  return result;
            userPortfolio.findOne({userId: userId}, function(err, wallet_details) {
                console.log(wallet_details);
                if(wallet_details == null ){
                    var walletData = {'userId': userId, 'balance': 0.00, referrals: [], partners: []};
                    const userW = new userPortfolio(walletData);
                     userW.save(function (err, result){
                         resolve(result)
                     });
                     
                }else{
                    var totalAfter =  parseFloat(wallet_details.balance) - parseFloat(trxData.amount);
                    var updateObject = {'balance': totalAfter}; 
                    userPortfolio.updateOne({ _id  : wallet_details._id}, {$set: updateObject},
                            function (err, portfolioResult){
                                if(portfolioResult){
                                    var transaction =  {"balanceAfter": totalAfter,
                                                        "balanceBefore": wallet_details.balance,
                                                        "amount": trxData.amount,
                                                        "fromUserId" : trxData.fromUserId,
                                                        "fromName" : trxData.fromName,
                                                        "toUserId" : trxData.toUserId,
                                                        "toName" : trxData.toName,
                                                        "transactionType" : trxData.transactionType,
                                                        "transactionStatus" : "DONE" };
                                      
                                    resolve  (debitHistory.addNewTransaction(transaction));
                                    
                            }            
                        });
             }
                
            });
        }
       
    });

    });
     
};

exports.addToWalletBalance = (userId, trxData) => {

    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      //  result = result.toJSON();
        if(result == null || result.length == 0)
        resolve("user_not_found");
        else{
          //  return result;
            userPortfolio.findOne({userId: userId}, function(err, wallet_details) {
    
                if(wallet_details == null ){
                    var walletData = {'userId': userId, 'balance': 0.00, referrals: [], partners: []};
                    const userW = new userPortfolio(walletData);
                     userW.save(function (err, result){
                         resolve(result)
                     });
                     
                }else{
                    var totalAfter =  parseFloat(wallet_details.balance) + parseFloat(trxData.amount);
                    var updateObject = {'balance': totalAfter}; 
                    userPortfolio.updateOne({ _id  : wallet_details._id}, {$set: updateObject},
                            function (err, portfolioResult){
                                if(portfolioResult){
                                    var transaction =  {"balanceAfter": totalAfter,
                                                        "balanceBefore": wallet_details.balance,
                                                        "amount": trxData.amount,
                                                        "fromUserId" : trxData.fromUserId,
                                                        "fromName" : trxData.fromName,
                                                        "toUserId" : trxData.toUserId,
                                                        "toName" : trxData.toName,
                                                        "transactionType" : trxData.transactionType,
                                                        "transactionStatus" : "DONE",
                                                        "reference": trxData.reference
                                                     };
                                      
                                    resolve  (creditHistory.addNewTransaction(transaction));
                                    
                            }            
                        });
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


exports.addToUserReferrals = (userId, Data ) => {
    return new Promise((resolve, reject) => {
              
        UserModel.findById(userId).then((result) => {
      
        if(result == null || result.length == 0)
        resolve("user_not_exist"); 
        else{
            var user_fullname = result.firstName+ " "+result.lastName;
            userPortfolio.findOne({userId: userId}, function(err, portfolio_details) {
               
                var currentRefs = portfolio_details.referrals;
                let ids = Data.phones;
                    ids.forEach((element, index, array) => {
                     
                    commonEmitter.emit('new_referral_sms_event', element, user_fullname);
                    resolve('sms_sent');
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
      if(result == null || result.length == 0)
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
    var parentAccess = this;
    return new Promise((resolve, reject) => {
        const userModel = mongoose.model("Users");    
        userModel.findOne({ _id: userId}, function (err, result) {
        //  result = result.toJSON();
        if(result == null || result.length == 0)
        resolve("user_not_exist"); 
        else{
            var user_fullname = result.firstName+ " "+result.lastName;

            userPortfolio.findOne({userId: userId}, function(err, portfolio_details) {
            
                var currentPartners = portfolio_details.partners;
                let ids = partnerData.phones;
                var idVerificationPromise = new Promise((resolve, reject) => {
                    var loop_counter = 0;
                    ids.forEach((element, index, array) => {
                        console.log("currentPartners", currentPartners,element);
                        let obj = currentPartners.find(o => o.phone  == element);
                        console.log("obj", array);
                        if(obj == undefined && element!= "" && result.phone != element){
                             //that is, phone is not been added before
                            UserModel.findByPhone(element).then((partnerUser) => {
                                loop_counter++;
                                //to ensure the user already exist
                            if(partnerUser != undefined || partnerUser != null){
                                
                                console.log("just added",element );  
                                var dateTime =  Date.now();
                                dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

                                currentPartners.push({ "userId": partnerUser._id, "phone": element, "status": 'PENDING', "createdAt": dateTime, "name": partnerUser.firstName+" "+partnerUser.lastName, "profilePicPath": partnerUser.profilePicPath});
                                
                                //commonEmitter.emit('new_financial_partner_sms_event', element, user_fullname);



                                userPortfolio.findOne({ userId: String( partnerUser._id) }, function (err, partnerPort){                     
                                var currentPartnerPartners = partnerPort.partners;
                                let obj = currentPartnerPartners.find(o => o.phone  == result.phone );
                                if(obj == undefined ){
                                    currentPartnerPartners.push({ "userId": result._id, "phone": result.phone, "status": 'PENDING', "createdAt": dateTime, "name": result.firstName+" "+result.lastName, "profilePicPath": result.profilePicPath});
                                }
                                var updateObject = {'partners': currentPartnerPartners}; // {last_name : "smith", age: 44}   
                                console.log("currentPartnerPartners", currentPartnerPartners);
                                userPortfolio.update({userId  : partnerPort.userId}, {$set: updateObject},
                                    function (err, done){
                                      
                                    });
                                });




                            }
                            if (loop_counter >= array.length) resolve();

                            });
                        }else{
                            loop_counter++;
                            if (loop_counter >= array.length ) resolve();
                            
                        }

                        
                    });
                });

  
                idVerificationPromise.then(() => {

                    var updateObject = {'partners': currentPartners}; // {last_name : "smith", age: 44}   
                 
                    userPortfolio.update({userId  : userId}, {$set: updateObject},
                          function (err, result){
                            console.log(result);
                            resolve(parentAccess.getUserPartners(userId));
                                   
                          
                          });
                });

                      
          
            });
        }
       
    });

    });
};


exports.removeFromUserPartners = (userId, partnerData ) => {
    var parentAccess = this;
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
                            
                            resolve(parentAccess.getUserPartners(userId));
                         
                          
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
            Users.find({ 'phone' : { $in: fieldArray } }, 'firstName lastName phone profilePicPath'  )
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
           let userPartners = [];
           if(result !=null){
            userPartners = result.partners;
            userPartners.forEach( (element, index)=> {
               idArray.push(element.phone);    
           });
        }

         var arrayPromise = new Promise( (resolve, reject)=>{
            resolve(getUserDetailsFromArray('phone', idArray));    
         }
         );
         //had to do this iteration again so as to include the partnership status
         arrayPromise.then((result)=>{
            var UserDetailsFromArray =  result; 
           
            UserDetailsFromArray.forEach( (element, index)=> {    
              let obj = userPartners.find(o => o.userId  == element.id);
              let status = ""; 
              if(obj != undefined ){
                    status =  obj.status;
              }
              UserDetailsFromArray[index] = {
                "firstName": element.firstName,
                "lastName": element.lastName,
                "phone": element.phone,
                "profilePicPath": element.profilePicPath,
                "id": element.id,
                "status": status
            };

             });

             resolve(UserDetailsFromArray);

         });


       
      
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



exports.confirmUserPartnershipStatus = (confirmationData)=> {
    var subjectUserId = confirmationData.subjectUserId;
    var requestedPartnerUserId = confirmationData.requestedPartnerUserId;
    var status = confirmationData.status;
    var parentAccess = this;
    return new Promise ( (resolve, reject) => {
        UserModel.findById(subjectUserId).then((result) => {
            //  result = result.toJSON();
            if(result == null || result.length == 0)
            resolve("subject_user_not_exist"); 
            else{
                var user_fullname = result.firstName+ " "+result.lastName;
    
                userPortfolio.findOne({userId: subjectUserId}, function(err, portfolio_details) {
                
                    var currentPartners = portfolio_details.partners;
                    
                        
                            let obj = currentPartners.find(o => o.userId  == requestedPartnerUserId);
                           
                            if(obj != undefined && obj != null){
                               
                                currentPartners.splice(currentPartners.indexOf(obj), 1);
                                
                                 var dateTime =  Date.now();
                                 dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
                                 obj.updatedAt  = dateTime;
                                 obj.status = status;

                                 currentPartners.push(obj);

                                var updateObject = {'partners': currentPartners}; 

                                userPortfolio.update({userId  : subjectUserId}, {$set: updateObject},
                                    function (err, result){

                                    resolve(parentAccess.getUserPartners(subjectUserId));
                                            
                                    });
                
                                
                                 //commonEmitter.emit('financial_partner_confirmation_sms_event', element, user_fullname);
    
                                
    
                            }else{
                                resolve("requested_partner_not_exist"); 
                            }
  
                    });
            }
           
        });
    });
};

exports.findById = (id) => {
    return userPortfolio.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};





