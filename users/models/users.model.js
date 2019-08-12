const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const UserPortfolioModel = require('./users_portfolio.model');

mongoose.connect(config.MONGO_URL);
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
        
        if(result.length > 0 ){
            resolve("phone_exist");         
        }
        else{

            User.find({email: userData.email}, function(err, result){
                if(result.length > 0 ){
                    resolve("email_exist");         
                }
                else{ 

                    const user = new User(userData);
                    user.save(
                        function (err, created_user){
                            var newUserId = created_user._id;
                            let user_portfolio =  UserPortfolioModel.createNewAccount(newUserId);  

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
    
    })

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
            user.save(function (err, updatedUser) {
                if (err) return reject(err);
                updatedUser = updatedUseruser.toJSON();
                delete updatedUser.password;
                resolve(updatedUser);
            });
        
             }
       
     });
     });
 }
 };


function IDGenerate() {
    var text = "";
   
    var possible = "ABCDEFGHIkLMNPQRSTUVWXYZ123456789";
    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));         
    }

    return text;
}

