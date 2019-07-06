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
            return res.status(400).send(response.failure(  errors.join(',')));

        } else {
            return next();
        }
    } else {
        //return res.status(400).send({errors: 'Missing phone and password fields'});
        return res.status(400).send(response.failure( "Missing phone and password fields"));
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
    UserModel.findAllByPhone(req.body.phone)
        .then((user)=>{
            if(!user[0]){
                //res.status(404).send({});
                return res.status(400).send({errors: ['user does not exist']});
            }else{
               
                let passwordFields = user[0].password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user[0]._id,
                        email: user[0].email,
                        phone: user[0].phone,
                        
                        firstName: user[0].firstName,
                        lastName: user[0].lastName,
                    };
                    console.log(user[0]);
                    return next();
                } else {
                    //console.log("hmm", user[0]);
                    return res.status(400).send({errors: ['Invalid phone or password']});
                }
            }
        });
};