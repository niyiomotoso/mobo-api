const UserModel = require('../../users/models/users.model');
const crypto = require('crypto');
const response = require('../../common/jsonResponse');

exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];

    if (req.body) {
        if (!req.body.phone) {
            errors.push('Missing phone field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
           // return res.status(400).send({errors: errors.join(',')});
            return res.status(200).send(response.failure(  errors.join(',')));

        } else {
            return next();
        }
    } else {
        //return res.status(400).send({errors: 'Missing phone and password fields'});
        return res.status(200).send(response.failure( "Missing phone and password fields"));
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
    UserModel.findByPhone(req.body.phone)
        .then((user)=>{
            if(!user){
                //res.status(404).send({});
                return res.status(200).send({errors: ['user does not exist']});
            }else{
               
                let passwordFields = user.password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    user = user.toJSON();
                    user.userId = user._id;
                    delete user.password;
                    req.body = user;
                    return next();
                } else {
                    //console.log("hmm", user[0]);
                    return res.status(200).send({errors: ['Invalid phone or password']});
                }
            }
        });
};