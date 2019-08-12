const UserModel = require('../models/users.model');
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
   
   UserModel.uploadUserProfilePic(req.params.userId, req.file.filename)
   .then((result) => {
       //res.status(200).send({result});
    if(result == "user_not_found"){
        res.status(200).send(response.failure("user_not_found", "user not found"));
   
    }else{
       res.status(200).send(response.success(result, "Pic Uploaded Successfully"));
    }
   });

};