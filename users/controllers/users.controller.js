const UserModel = require('../models/users.model');
const projectModel = require('../../projects/models/project.model');
const loanModel = require('../../loans/models/loan.model');
const crypto = require('crypto');
const response = require('../../common/jsonResponse');

exports.insert = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    UserModel.createUser(req.body)
        .then((result) => {
            //res.status(201).send({id: result._id});
            console.log("controller", result);
            if(result == "phone_exist"){
                res.status(200).send(response.failure("phone_exist", "phone number already exist"));
           
            }else if(result == "email_exist"){
                res.status(200).send(response.failure("email_exist", "email already exist"));
           
            }else{
                res.status(200).send(response.success({id: result.userId}, "User Added Successfully"));
            
            }
        });
};


exports.resendActivationCode = (req, res) => {
    if(req.body == undefined || req.body.phone == undefined){
        res.status(200).send(response.failure("phone_is_required", "phone number is required"));
    }else{
    UserModel.resendActivationCode(req.body)
        .then((result) => {
            if(result == "phone_not_found"){
                res.status(200).send(response.failure("phone_not_found", "phone not found"));
    
            }else{
                res.status(200).send(response.success({id: result.phone}, "Activation Code Sent"));          
            }
        });
    }
};

exports.resetPassword = (req, res) => {
    if(req.body == undefined || req.body.phone == undefined){
        res.status(200).send(response.failure("phone_is_required", "phone number is required"));
    }else{
    UserModel.generateResetPin(req.body)
        .then((result) => {
            if(result == "phone_not_found"){
                res.status(200).send(response.failure("phone_not_found", "phone not found"));
    
            }else{
                res.status(200).send(response.success(result, "Password Reset Pin sent"));          
            }
        });
    }
};


exports.verifyNewPassword = (req, res) => {
    if(req.body == undefined || req.body.phone == undefined || req.body.currentPassword ==undefined || req.body.newPassword == undefined){
        res.status(200).send(response.failure("phone_is_required", "phone number, current password and new password are required"));
    }else{
    UserModel.verifyNewPassword(req.body)
        .then((result) => {
            if(result == "phone_not_found"){
                res.status(200).send(response.failure("phone_not_found", "phone not found"));
    
            }
            else if(result == "invalid_new_pass"){
                res.status(200).send(response.failure("invalid_new_pass", "invalid current password/pin"));
    
            }else{
                res.status(200).send(response.success(result, "Password Reset Successful"));          
            }
        });
    }
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getById = (req, res) => {
    UserModel.findById(req.params.userId)
        .then((result) => {
         
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};
exports.getUserPartnerProjects = (req, res) => {
    projectModel.getUserPartnerProjects(req.params.userId)
        .then((result) => {   
            if(result == "user_not_found"){
                res.status(200).send(response.failure("user_not_found", "user not found"));
           
            }else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        
        });
};
exports.getUserPartnerLoans = (req, res) => {
    loanModel.getUserPartnerLoans(req.params.userId)
        .then((result) => {   
            if(result == "user_not_found"){
                res.status(200).send(response.failure("user_not_found", "user not found"));
           
            }else{
            res.status(200).send(response.success(result, "Loaded Successfully"));
        }
        
        });
};
exports.patchById = (req, res) => {
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }


    UserModel.patchUser(req.params.userId, req.body)
        .then((result) => {
            //res.status(200).send({result});
            if(result == "user_not_found"){
                res.status(200).send(response.failure("user_not_found", "user not found"));
           
            }else{
            res.status(200).send(response.success(result, "Edited Successfully"));
            }
        });

};

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            //res.status(200).send({});
            res.status(200).send(response.success(result, "Deleted Successfully"));
        
        });
};

exports.uploadUserProfilePic = (req, res) => {
    console.log("req.file",req.file);
   if(req.file != undefined ){
   UserModel.uploadUserProfilePic(req.params.userId, req.file.location)
   .then((result) => {
       //res.status(200).send({result});
    if(result == "user_not_found"){
        res.status(200).send(response.failure("user_not_found", "user not found"));
   
    }else{
       res.status(200).send(response.success(result, "Pic Uploaded Successfully"));
    }
   });
   }
   else{
        res.status(200).send(response.failure("no_pic_attached", "Profie picture not attached"));  
   }

};


exports.verifyPhone = (req, res) => {
    if(req.query.phoneNumber == undefined || req.query.verificationCode == undefined ){

        res.status(200).send(response.failure("params_not_set", "Phone Number or verification Code not set"));
    }
    else{
    UserModel.verifyPhone(req.query.phoneNumber, req.query.verificationCode)
    .then((result) => {
        //res.status(200).send({result});
     if(result == "invalid_verification_details"){
         res.status(200).send(response.failure("invalid_verification_details", "invalid verification details"));
    
     }else{
        res.status(200).send(response.success(result, "Verification successful"));
     }
    });
    }
    
 
 };


