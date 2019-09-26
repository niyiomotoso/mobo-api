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
    projectName:String,
    targetAmount: Number,
    totalContributedAmount: Number,
    targetTime: String,
    //ACTIVE, CANCELLED, INACTIVE
    status: String,
    //AMOUNT_TARGET, TIME_TARGET
    targetMode: String,
    projectType: String,
    coverImage: String,
    groupId: String,
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
    var projectName = projectData.projectName;
    var groupId = projectData.groupId;
    var status =  'ACTIVE';
    var contributions = [];
    var withdrawals = [];
    var projectType = projectData.projectType;
    var coverImage =  '';
    if(projectData.coverImage != undefined && projectData.coverImage != null ){
        coverImage = config.project_image_path+projectData.coverImage;
    }

    let session = {"userId": userId, "targetAmount": targetAmount, "targetMode":
        targetMode, "targetTime" : targetTime, "totalContributedAmount": totalContributedAmount,
        "status": status, "contributions": contributions, "withdrawals": withdrawals, "projectName": projectName,
        "projectType": projectType, "coverImage" : coverImage, "groupId": groupId
     };
  //   var maximumAllowed =  this.getMaximumProject(userId);

    const project = new projectSession(session);
 
    return new Promise ( ( resolve, reject) => {
        if(groupId != undefined && groupId != null){
            const groupSession = mongoose.model("groupSession");
            groupSession.findById(groupId, function (err, group) {
                if(group == null ){
                    resolve("group_not_found");         
                }
                else{
                    project.save(
                        function(err, savedSession){
                            resolve(savedSession);
                        }
                    );
                }
            });
        }else{
        project.save(
            function(err, savedSession){
                resolve(savedSession);
            }
        );
        }
    });
};


exports.getUserProjects = (req)=>{
    var userId = req.params.userId;
    var projectType = req.query.projectType;

    return new Promise( (resolve, reject)=> {

        if(projectType != undefined){
            projectSession.find ({"userId" : userId, "projectType": projectType}, function( err, result ){
                resolve(result);
            });
        }else{
            projectSession.find ({"userId" : userId}, function( err, result ){
                resolve(result);
            });
        }


    });

};

exports.addContributionToProject = (projectData)=>{
    return new Promise( (resolve, reject)=> {
        var projectId = projectData.projectId;
        var userId = projectData.contributorUserId;
        var amount = projectData.amount;

        const UserPortfolio = mongoose.model('UserPortfolio');
        const User = mongoose.model('Users');
        User.findOne ({ _id : userId}, function( err, userDetials ){
        if( userDetials == undefined || userDetials == null ){
                resolve('user_not_found'); 
            }

        else{
            UserPortfolio.findOne ({ userId : userId}, function( err, portfolio ){
                if( portfolio == undefined || portfolio == null ){
                    resolve('user_not_found'); 
                }
                else if( parseFloat(portfolio.balance) < parseFloat(amount) ){
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
            contributions.push({ "userId": userId, "amount": amount, "status": 1, "createdAt": dateTime, 'name': userDetials.firstName+" "+userDetials.lastName });     
                                            
                    //}

                var updateObject = {'contributions': contributions, 'totalContributedAmount': totalContributedAmount}; 

                projectSession.update({ _id  : projectId}, {$set: updateObject},
                    function (err, projectSessionresult){
                        if(projectSessionresult){     
                            //deduct from contributor's balance
                            var newBalance = parseFloat(portfolio.balance) - parseFloat(amount);
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
         } });
    });

};


exports.updateProjectStatus = (projectId, status)=>{
    return new Promise( (resolve, reject)=> {
       
        projectSession.findOne ({_id : projectId}, function( err, projectData ){
            if( projectData == undefined || projectData == null )
              resolve('project_id_not_found');
            else if(status == "CLOSED" && projectData.targetMode == "ANYTIME"){
           
                var updateObject = {'status': status};  
                projectSession.updateOne({ _id  : projectId}, {$set: updateObject},
                    function (err, result){
                        if(result){     
                            projectSession.findOne({_id : projectId}, function(err, result){     
                            resolve(result);
                        }); 
                    }
                            
                    });

            }
            else{
            resolve('invalid_status');
        }
      
    });
  
});
};






