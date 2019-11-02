const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const UserPortfolioModel = require('./users_portfolio.model');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var mailer = require('../../event_listeners/mailer');
const crypto = require('crypto');

mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    phone: String,
    permissionLevel: Number,
    profilePicPath: String,
    accountNumber: String,
    AccountName: String,
    bankName: String,
    gender: String,
    dateOfBirth: String,
    activationCode:String,
    status: String,
    isMembershipFeePaid: Boolean

}, {timestamps: true});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').findOne({id: this.id}, cb);
};

const User = mongoose.model('Users', userSchema);

exports.findByEmail = (email) => {
    return User.findOne({email: email});
};

exports.findAllByEmail = (email) => {
    return User.find({email: email});
};

exports.findAllByPhone = (phone) => {
    return User.find({phone: phone});
};

exports.findByPhone = (phone) => {
    return User.findOne({phone: phone});
};

exports.findByUserId = (id) => {
    return User.findOne({'_id' : id});
};
exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            if(result != null){
            result = result.toJSON();
            delete result._id;
            delete result.__v;
          }
            return result;
        });
};

exports.createUser = (userData) => {
   // userData.referralCode  = IDGenerate();
    if(userData.phone != undefined){
    return new Promise((resolve, reject )=>{
         User.find({phone: userData.phone}, function(err, result){
        
        if(result!= null && result != undefined && result.length > 0 ){
            resolve("phone_exist");         
        }
        else{

            User.find({email: userData.email}, function(err, result){
                if(result.length > 0 ){
                    resolve("email_exist");         
                }
                else{ 
                    userData.status = "UNVERIFIED";
                    userData.activationCode =  generateVerficationCode();
                    userData.isMembershipFeePaid= false;
                    const user = new User(userData);
                    user.save(
                        function (err, created_user){
                            var newUserId = created_user._id;
                            let user_portfolio =  UserPortfolioModel.createNewAccount(newUserId);  
                            mailer.userRegister(created_user.firstName, created_user.email, created_user.activationCode);
                            commonEmitter.emit('new_user_for_verification', userData.phone, userData.activationCode);

                            if(userData.referralPhone != undefined || userData.referralPhone != null){
                                referralPhone = userData.referralPhone;
                                userPhone = userData.phone;
                                User.findOne({phone: referralPhone}, function(err, result){
                                    if(result != undefined  ){
                                        var refererId = result._id;
                                        UserPortfolioModel.confirmUserReferrals( refererId ,  {"phones" : [userPhone] }, newUserId );
                            
                                    }
                                });
        
                            }


                        resolve(user_portfolio);

                        }
                    );
                }
        }); 
        }
    });
    });
}
};


exports.resendActivationCode = (userData) => {
    // userData.referralCode  = IDGenerate();
     if(userData.phone != undefined){
     return new Promise((resolve, reject )=>{
          User.find({phone: userData.phone}, function(err, result){
         
         if(result.length  == 0 ){
             resolve("phone_not_found");         
         }
         else{
                     var activationCode =  generateVerficationCode();
                     userData.activationCode = activationCode;
                     const user = mongoose.model('Users');
                     var updateObject = {"activationCode": activationCode};
                     user.updateOne( {phone: userData.phone}, {$set: updateObject},
                         function (err, updated_user){
                        
                            commonEmitter.emit('new_user_for_verification', userData.phone, activationCode); 
                            if(updated_user.nModified == 1){
                            resolve(userData);
                            }
 
                         }
                     );
                 }
     });
     });
 }
 };



 exports.generateResetPin = (userData) => {
    // userData.referralCode  = IDGenerate();
     if(userData.phone != undefined){
     return new Promise((resolve, reject )=>{
          User.findOne({phone: userData.phone}, function(err, result){
         
         if(result  == null ){
             resolve("phone_not_found");         
         }
         else{
                     var activationCode =  generateVerficationCode();
                     let salt = crypto.randomBytes(16).toString('base64');
                     let hash = crypto.createHmac('sha512', salt).update(activationCode).digest("base64");
                     userData.password = salt + "$" + hash;
                     const user = mongoose.model('Users');
                     var updateObject = {"password": userData.password};
                     user.updateOne( {phone: userData.phone}, {$set: updateObject},
                         function (err, updated_user){
                            mailer.userResetPin(result.firstName, result.email, activationCode);
                            commonEmitter.emit('new_user_reset_pin', userData.phone, activationCode); 
                            if(updated_user.nModified == 1){
                            resolve(userData);
                            }
 
                         }
                     );
                 }
     });
     });
 }
 };


 exports.verifyNewPassword = (userData) => {
    // userData.referralCode  = IDGenerate();
     if(userData.phone != undefined){
     return new Promise((resolve, reject )=>{
          User.findOne({phone: userData.phone}, function(err, user){
         
         if(user  == null ){
             resolve("phone_not_found");         
         }
         else{
            let passwordFields = user.password.split('$');
            let salt = passwordFields[0];
            let hash = crypto.createHmac('sha512', salt).update(userData.currentPassword).digest("base64");
            if (hash === passwordFields[1]) {

                var newPass =  userData.newPassword;
                let salt = crypto.randomBytes(16).toString('base64');
                let hash = crypto.createHmac('sha512', salt).update(newPass).digest("base64");
                let passwordHash = salt + "$" + hash;
                const userModel = mongoose.model('Users');
                var updateObject = {"password": passwordHash};
                userModel.updateOne( {phone: userData.phone}, {$set: updateObject},
                    function (err, updated_user){
                      
                       if(updated_user.nModified == 1){
                       resolve(user);
                       }

                    }
                );
                
            } else {
                 resolve('invalid_new_pass');

            }       
                 }
     });
     });
 }
 };

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (id, userData) => {
    return new Promise((resolve, reject) => {
        User.findById(id, function (err, user) {
            if(user == null ){
                resolve("user_not_found");         
            }
            else{
            userData.updated_at = new Date();
            for (let i in userData) {
                user[i] = userData[i];
            }
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                resolve(updatedUser);
            });
         }
        });
    
    });

};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.remove({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};


exports.uploadUserProfilePic = (userId, filePath) => {
    // userData.referralCode  = IDGenerate();
     if(userId != undefined){
     return new Promise((resolve, reject )=>{
          User.findOne({_id: userId}, function(err, user){
         if(user == null ){
             resolve("user_not_found");         
         }
         else{
            user.profilePicPath = filePath;
            //user.profilePicPath = config.cdn_path+filePath;
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                updatedUser = updatedUser.toJSON();        
                delete updatedUser.password;
                resolve(updatedUser);
            });
        
             }
       
     });
     });
 }
 };



exports.verifyPhone = (phoneNumber, activationCode) => {
    
    return new Promise((resolve, reject) => {
        User.findOne({'phone': phoneNumber, 'activationCode': activationCode}, function(err, user){
            if(user == null ){
                resolve("invalid_verification_details");         
            }
            else{
                user.status = "VERIFIED";
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                delete updatedUser.password;
                resolve(updatedUser);
            });
         }
        });
    
    });
   
 };


function IDGenerate() {
    var text = "";
   
    var possible = "ABCDEFGHIkLMNPQRSTUVWXYZ123456789";
    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));         
    }

    return text;
}
function generateVerficationCode(){
    var text = "";
    var d = new Date();
    var possible = String(d.getTime());
    for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));         
    }
return text;

}

