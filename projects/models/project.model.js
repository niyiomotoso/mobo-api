const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');

const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
mongoose.connect(config.MONGO_URL);
const Schema = mongoose.Schema;

const projectSessionSchema = new Schema({
    userId: String,
    targetAmount: Number,
    totalContributedAmount: Number,
    targetTime: String,
    //ACTIVE, CANCELLED, INACTIVE
    status: String,
    //AMOUNT_TARGET, TIME_TARGET
    targetMode: String,
    contributions: Array,
    withdrawals: Array
    
}, {timestamps: true});

projectSessionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
projectSessionSchema.set('toJSON', {
    virtuals: true
});

projectSessionSchema.findById = function (cb) {
    return this.model('projectSession').find({id: this.id}, cb);
};

const projectSession = mongoose.model('projectSession', projectSessionSchema);

// exports.getMaximumProject = (userId) => {

//     return new Promise((resolve, reject) => {
              
//         UserModel.findById(userId).then((result) => {
//         if(result == null || result.length == 0)
//         resolve(null);
//         else{            
//             UserPortfolioModel.getUserPartnersWalletDetails(userId)
//             .then((user_partners) => {
//                 var totalAvailable = 0;
                
//                 user_partners.forEach(element => {
//                 totalAvailable = totalAvailable + parseFloat(element.balance);

//                 });

//                 resolve(totalAvailable);
//             });
//         }
       
//     });

//     });
     
// };

exports.makeProjectRequest = (projectData)=> {



    var userId=  projectData.userId;
    var targetAmount =  projectData.targetAmount;
    var totalContributedAmount  = 0;
    var targetMode = projectData.targetMode;
    var targetTime = projectData.targetTime;
    var status =  'ACTIVE';
    var contributions = [];
    var withdrawals = [];

    let session = {"userId": userId, "targetAmount": targetAmount, "targetMode":
        targetMode, "targetTime" : targetTime, "totalContributedAmount": totalContributedAmount,
        "status": status, "contributions": contributions, "withdrawals": withdrawals
     };
  //   var maximumAllowed =  this.getMaximumProject(userId);

    const project = new projectSession(session);
    // if( parseFloat(maximumAllowed) < parseFloat(targetAmount) ){
    //     return 'limit_exceeded';
    // }else{
    return new Promise ( ( resolve, reject) => {
        project.save(
            function(err, savedSession){
                resolve(savedSession);
            }
        );
        }
    )
//}
};


exports.getUserProjects = (userId)=>{
    return new Promise( (resolve, reject)=> {
        projectSession.find ({"userId" : userId}, function( err, result ){
            resolve(result);
        });
    });

};

exports.addContributionToProject = (projectData)=>{
    return new Promise( (resolve, reject)=> {
        var projectId = projectData.projectId;
        var userId = projectData.contributorUserId;
        var amount = projectData.amount;

        const UserPortfolio = mongoose.model('UserPortfolio');

        UserPortfolio.findOne ({ userId : userId}, function( err, portfolio ){
            if( portfolio == undefined || portfolio == null ){
                resolve('user_not_found'); 
            }
            else if( float(portfolio.balance) < float(amount) ){
                resolve('contributor_insufficient_balance'); 
            }
       else{
        
        projectSession.findOne ({_id : projectId}, function( err, projectData ){
            if( projectData == undefined || projectData == null )
              resolve('project_id_not_found');
            else{
 
            let contributions = projectData.contributions;
           
            var dateTime =  Date.now();
            dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
            

            var totalContributedAmountAfterNewContribution =  parseFloat(projectData.totalContributedAmount) + parseFloat( amount);
            
            if(totalContributedAmountAfterNewContribution > parseFloat(projectData.targetAmount) ){
                resolve('requested_amount_exceeded');
            }
            else{
                // let obj = contributions.find(o => o.userId  == userId);

                // if(obj != undefined ){
                  //if already exist, removed the current from the newly added
                //    contributions.splice(contributions.indexOf(obj), 1);
                  
                //    var totalContributedAmount =  totalContributedAmountAfterNewContribution - parseFloat(obj.amount);
                //    contributions.push({ "userId": userId, "amount": amount, "status": 1, "createdAt": dateTime});                   
                // }else{
            var totalContributedAmount =  totalContributedAmountAfterNewContribution;
            contributions.push({ "userId": userId, "amount": amount, "status": 1, "createdAt": dateTime});     
                                            
                    //}

                var updateObject = {'contributions': contributions, 'totalContributedAmount': totalContributedAmount}; 

                projectSession.update({ _id  : projectId}, {$set: updateObject},
                    function (err, projectSessionresult){
                        if(projectSessionresult){     
                            //deduct from contributor's balance
                            var newBalance = float(portfolio.balance) - float(amount);
                            var updateObject = {'balance': newBalance}; 
                            UserPortfolio.update({ userId  : userId}, {$set: updateObject},
                                function (err, portfolioUpdateResult){
                                    if(portfolioUpdateResult){  
                                        projectSession.findOne({_id : projectId}, function(err, result){     
                                        resolve({ "projectId": projectId, "targetAmount": result.targetAmount, "totalContributedAmount": result.totalContributedAmount});
                        }); 
                        }
                            
                    });
                    }
                            
            });

            }
     
            }
        });
    }
    });
    });

};







