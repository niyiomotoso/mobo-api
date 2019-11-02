const jwtSecret = process.env.jwt_secret,
    jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuid = require('node-uuid');
const response = require('../../common/jsonResponse');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
const GroupModel = require('../../groups/models/group.model');

const ProjectModel = require('../../projects/models/project.model');
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
        let custom_req = {};
        //res.status(200).send(response.success({accessToken: token, refreshToken: refresh_token}, "Login Success"));
        UserPortfolioModel.getUserPartners(req.body.userId)
        .then((user_partners) => {
            
            UserPortfolioModel.getUserReferrals(req.body.userId)
            .then((user_referrals) => {
                 custom_req = {"params": {"userId": req.body.userId}, "query": {"projectType": "PRIVATE"}  }
    
                ProjectModel.getUserProjects(custom_req)
                .then((private_projects) => {
                     custom_req = {"params": {"userId": req.body.userId}, "query": {"projectType": "PUBLIC"}  }
    
                    ProjectModel.getUserProjects(custom_req)
                    .then((public_projects) => {
                        custom_req = {"params": {"phone": req.body.phone}  }
                GroupModel.getUserGroupsByPhone(custom_req)
                    .then((user_groups) => {
                        if(user_groups == "user_not_found")
                            user_groups = [];
                        custom_req = {"params": {"userId": req.body.userId}, "query": {"projectType": "GROUP"}  }
    
                        ProjectModel.getUserProjects(custom_req)
                        .then((group_projects) => {
                
                UserPortfolioModel.getUserWalletBalance(req.body.userId)
                .then((balance) => {
                    UserAssessment.findByUserId(req.body.userId)
                        .then((assessment) => {
                        var newobject = {};
                        newobject = req.body;
                        newobject["balance"] = balance;
                            res.status(200).send(response.success({accessToken: token, refreshToken: refresh_token, 
                            balance: balance, partners: user_partners, referrals: user_referrals, bio: newobject, assessment_question: assessment,
                        private_projects: private_projects, public_projects: public_projects, group_projects: group_projects, user_groups: user_groups}, "Login Success"));
            
                        });
                });
            
            });
        });
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
        UserModel.findById(req.params.userId)
        .then((user) => {
            delete user.password;
        UserPortfolioModel.getUserPartners(req.params.userId)
        .then((user_partners) => {
            
            UserPortfolioModel.getUserReferrals(req.params.userId)
            .then((user_referrals) => {
                custom_req = {"params": {"userId": req.params.userId}, "query": {"projectType": "PRIVATE"}  }
    
                ProjectModel.getUserProjects(custom_req)
                .then((private_projects) => {
                     custom_req = {"params": {"userId": req.params.userId}, "query": {"projectType": "PUBLIC"}  }
    
                    ProjectModel.getUserProjects(custom_req)
                    .then((public_projects) => {
                        custom_req = {"params": {"userId": req.params.userId}, "query": {"projectType": "GROUP"}  }
    
                        ProjectModel.getUserProjects(custom_req)
                        .then((group_projects) => {
                            custom_req = {"params": {"phone": user.phone}  }
                            GroupModel.getUserGroupsByPhone(custom_req)
                                .then((user_groups) => {
                                    if(user_groups == "user_not_found")
                                        user_groups = [];
                UserPortfolioModel.getUserWalletBalance(req.params.userId)
                .then((balance) => {
                    UserAssessment.findByUserId(req.params.userId)
                        .then((assessment) => {
                            user.balance = balance;
                            res.status(200).send(response.success({ 
                            balance: balance, partners: user_partners, referrals: user_referrals, bio: user, assessment_question: assessment,
                            private_projects: private_projects, public_projects: public_projects, group_projects: group_projects, user_groups: user_groups}, "Refresh Success"));
            
                        });
                });
            
            });
        });
        
        });
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
