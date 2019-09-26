const jwtSecret = require('../../common/config/env.config.js').jwt_secret,
    jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuid = require('node-uuid');
const response = require('../../common/jsonResponse');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserAssessment = require('../../assessment_questions/models/assessment_question.model');

exports.login = (req, res) => {
    try {
        let refreshId = req.body.userId + jwtSecret;
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
        req.body.refreshKey = salt;
        let token = jwt.sign(req.body, jwtSecret);
        let b = new Buffer(hash);
        let refresh_token = b.toString('base64');
        
        //res.status(200).send(response.success({accessToken: token, refreshToken: refresh_token}, "Login Success"));
        UserPortfolioModel.getUserPartners(req.body.userId)
        .then((user_partners) => {
            
            UserPortfolioModel.getUserReferrals(req.body.userId)
            .then((user_referrals) => {
                
                UserPortfolioModel.getUserWalletBalance(req.body.userId)
                .then((balance) => {
                    UserAssessment.findByUserId(req.body.userId)
                        .then((assessment) => {
                            
                            res.status(200).send(response.success({accessToken: token, refreshToken: refresh_token, 
                            balance: balance, partners: user_partners, referrals: user_referrals, bio: req.body, assessment_question: assessment}, "Login Success"));
            
                        });
                });
            
            });
        
        });

    } catch (err) {
        res.status(500).send({errors: err});
    }
};

exports.refresh = (req, res) => {
    try {
       
        //res.status(200).send(response.success({accessToken: token, refreshToken: refresh_token}, "Login Success"));
        UserPortfolioModel.getUserPartners(req.params.userId)
        .then((user_partners) => {
            
            UserPortfolioModel.getUserReferrals(req.params.userId)
            .then((user_referrals) => {
                
                UserPortfolioModel.getUserWalletBalance(req.params.userId)
                .then((balance) => {
                    UserAssessment.findByUserId(req.params.userId)
                        .then((assessment) => {
                            
                            res.status(200).send(response.success({ 
                            balance: balance, partners: user_partners, referrals: user_referrals, bio: req.body, assessment_question: assessment}, "Refresh Success"));
            
                        });
                });
            
            });
        
        });

    } catch (err) {
        res.status(500).send({errors: err});
    }
};

exports.refresh_token = (req, res) => {
    try {
        req.body = req.jwt;
        let token = jwt.sign(req.body, jwtSecret);
        res.status(201).send({id: token});
    } catch (err) {
        res.status(500).send({errors: err});
    }
};
