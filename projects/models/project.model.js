const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');

const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;

const projectSessionSchema = new Schema({
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
    description: String,
    contributions: Array,
    withdrawals: Array,
    userId: {
        type: mongoose.Schema.Types.ObjectId,                             
        ref: 'Users'
      },
      groupId: {
        type: mongoose.Schema.Types.ObjectId,                             
        ref: 'groupSession'
      }
    
    
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
    var description = projectData.description;
    var projectName = projectData.projectName;
    var groupId = projectData.groupId;
    var status =  'ACTIVE';
    var contributions = [];
    var withdrawals = [];
    var projectType = projectData.projectType;
    var coverImage =  '';
    if(projectData.coverImage != undefined && projectData.coverImage != null ){
        //coverImage = config.cdn_path+projectData.coverImage;
        coverImage = projectData.coverImage;
    }

    let session = {"userId": userId, "targetAmount": targetAmount, "description": description, "targetMode":
        targetMode, "targetTime" : targetTime, "totalContributedAmount": totalContributedAmount,
        "status": status, "contributions": contributions, "withdrawals": withdrawals, "projectName": projectName,
        "projectType": projectType, "coverImage" : coverImage, "groupId": groupId
     };
  //   var maximumAllowed =  this.getMaximumProject(userId);

    const project = new projectSession(session);
 
    return new Promise ( ( resolve, reject) => {
        const user = mongoose.model("Users");
            
        user.findOne({_id : userId}, function (err, userDetials) {
            if(userDetials == null ){
                resolve("user_not_found");         
            }
            else{
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
        }}

    });
});
    
};


exports.getUserProjects = (req)=>{
    var userId = req.params.userId;
    var projectType = req.query.projectType;

    return new Promise( (resolve, reject)=> {
        const user = mongoose.model("Users");
        user.findOne({_id : userId}, function(err, user){
                     
            if(user == undefined || user == null){
                resolve('user_not_found');
            }
            user = user.toObject();
            delete user.password;
        if(projectType != undefined){
            projectSession.find ({"userId" : userId, "projectType": projectType}, null, {
                sort:{
                 updatedAt: -1 //Sort by Date Added DESC
                }}, function( err, result ){
                if(result == null){
                    resolve(null);
                }
                
                result.forEach( (project, index) => {
                    result[index]  = result[index].toObject();
                    result[index].owner = user;
                });

                resolve(result);
            });
        }else{
            projectSession.find ({"userId" : userId}, null, {
                sort:{
                 updatedAt: -1 //Sort by Date Added DESC
                }}, function( err, result ){
                if(result == null){
                    resolve(null);
                }
                
                result.forEach( (project, index) => {
                    result[index]  = result[index].toObject();
                    result[index].owner = user;
                });

                resolve(result);
            });
        }
    });

    });

};


exports.getProjectDetails = (projectId)=>{
    
    return new Promise( (resolve, reject)=> {

            projectSession.findOne ({_id : projectId}, function( err, project ){
                if(project == null || project == undefined){
                    resolve("project_id_not_found");
                }else{
                    const user = mongoose.model("Users");
                    user.findOne({_id : project.userId}, function(err, creator){
                     
                    if(creator == undefined || creator == null){
                        resolve('owner_not_found');
                    }
                    project = project.toObject();
                    project.owner = creator;
                  
                if((project.contributions != undefined && project.contributions.length> 0   )){
                    var counter = 0;
                    project.contributions.forEach((contributor,index) => {
                        
                        user.findOne({_id: contributor.userId}, function(err, userDetials){
                            counter++;
                            if(userDetials != null && userDetials != undefined){
                                contributor.name = userDetials.firstName+ " "+userDetials.lastName;
                                contributor.profilePicPath = userDetials.profilePicPath;
                                project.contributions[index] = contributor;
                           }else{
                            project.contributions[index] = null;
                           }
                           
                           if(counter == project.contributions.length){
                               var newProjectObject = project;
                              
                               //newProjectObject.ownerProfilePicPath = creator.profilePicPath;
                                resolve(newProjectObject);
                           }
                        });
                       // counter
                    });
                }else{
                    var newProjectObject = project;
                    //newProjectObject.ownerProfilePicPath = creator.profilePicPath;
                    resolve(newProjectObject);
                    
                }
            });
            }
            });
        
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
            contributions.push({ "userId": userId, "amount": amount, "status": 1, "createdAt": dateTime, 'name': userDetials.firstName+" "+userDetials.lastName, "profilePicPath": userDetials.profilePicPath });     
                                            
                    //}

                var updateObject = {'contributions': contributions, 'totalContributedAmount': totalContributedAmount}; 
                if(parseFloat(projectData.targetAmount) <= totalContributedAmountAfterNewContribution){
                    updateObject.status = "CLOSED";
                }

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
                                        resolve({ "projectId": projectId, "targetAmount": result.targetAmount, "totalContributedAmount": result.totalContributedAmount, "walletBalance": newBalance });
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

exports.getUserPartnerProjects  = (userId)=>{

    return new Promise ((resolve, reject) =>{
        const userPortfolio = mongoose.model('UserPortfolio');
       userPortfolio.findOne({userId: userId}, function(err, result){
           idArray = [];
           if(result ==null){
            resolve('user_not_found'); 
           }
           else{
           result.partners.forEach( (element, index)=> {
               console.log(element.userId);
               idArray.push(  element.userId );    
           });
           console.log(idArray);
            const projects = mongoose.model("projectSession");
            projects.aggregate([
                                
                                {
                                  $match:{"userId": { "$in": idArray },
                                   projectType : 'PUBLIC'}
                                },
                               
                                {
                                   $lookup:
                                   {
                                       from: "users",
                                       localField: "userId",
                                       foreignField: "_id",
                                       as: "owner"
                                   }
                                }
                                ,
                                {$unwind: '$owner'}
                               
                                ]).sort({ updatedAt : 'desc'}).exec().then((data) => {
                                    console.log("data",data);
                                    resolve(data);
                                  }).catch((err) => {
                                    console.error("err",err);
                                  });


        }
       
      }); 


    });


   }







