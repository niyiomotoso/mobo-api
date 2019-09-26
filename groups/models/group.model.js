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

const groupSessionSchema = new Schema({
    creatorUserId: String,
    name:String,
    description: String,
    //ACTIVE, CANCELLED, INACTIVE
    status: String,
    groupImage: String,
    groupUsers: Array    
}, {timestamps: true});

groupSessionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
groupSessionSchema.set('toJSON', {
    virtuals: true
});

groupSessionSchema.findById = function (cb) {
    return this.model('groupSession').find({id: this.id}, cb);
};

const groupSession = mongoose.model('groupSession', groupSessionSchema);

exports.makeGroupRequest = (groupData)=> {



    var name=  groupData.name;
    var creatorUserId =  groupData.creatorUserId;
    var description = groupData.description;
    var status =  'ACTIVE';
    var groupImage =  '';
    if(groupData.groupImage != undefined && groupData.groupImage != null){
        groupImage = config.group_image_path+groupData.groupImage;
    }
    var dateTime =  Date.now();
    dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
    let session = {"name": name, "creatorUserId": creatorUserId, "description":
        description,"status": status,  "groupImage" : groupImage, "groupUsers": [{ "userId": creatorUserId,  "createdAt": dateTime}]
        };
 
    const group = new groupSession(session);
  
    return new Promise ( ( resolve, reject) => {
        group.save(
            function(err, savedSession){
                resolve(savedSession);
            }
        );
        }
    )

};


exports.getUserGroups = (req)=>{
    var userId = req.params.userId;
    
    return new Promise( (resolve, reject)=> {

        groupSession.find({'groupUsers.userId': userId}, function(err, groups) {
           
            groups.forEach((group, group_index )=> {
                var user_ids = Array();
                
                if(Array.isArray(group.groupUsers)){
                    group.groupUsers.forEach(user_data =>{
                     
                        user_ids.push(user_data.userId);
                    });
                }
            
                
                getUserDetailsFromArray('_id', user_ids).then(function(usersDetails){
                   
                    groups[group_index].usersDetails = usersDetails;
                });


                
            });
            console.log("groups ", groups);

            
        });

        
       
    });

};

function getUserDetailsFromArray(field_to_search, fieldArray){
    
    return new Promise((resolve, reject) => {
            const Users = mongoose.model('Users');
            userDArray = [];    
            field_to_search = field_to_search.toString();     
            Users.find({ '_id' : { $in: fieldArray } }, 'firstName lastName phone'  )
             .exec(function(err, userDArray) {
                resolve(userDArray);
            });
           
    });
}

exports.addUsersToGroup = (groupData)=>{
    return new Promise( (resolve, reject)=> {
        var groupId = groupData.groupId;
        var userIds = groupData.userIds;
        
    
        groupSession.findOne ({ _id : groupId}, function( err, group ){
            if( group == undefined || group == null ){
                resolve('group_not_found'); 
            }
       else{
        if(Array.isArray(userIds)){
            console.log("userIds", userIds);
            userIds.forEach(userId => {
            
           
            const users = mongoose.model('Users');
            users.findOne ({_id : userId}, function( err, userData ){
            if( userData == undefined || userData == null ){
                //user not exist
            }  
            else{
                let groupUsers = group.groupUsers;
           
                var dateTime =  Date.now();
                dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
                let obj = groupUsers.find(o => o.userId  == userId);
                if(obj == undefined ){
                    groupUsers.push({ "userId": userId,  "createdAt": dateTime});                   
                }

                var updateObject = {'groupUsers': groupUsers}; 

                groupSession.update({ _id  : groupId}, {$set: updateObject},
                    function (err, result){
                        if(result){   
                           
                            //loanSession.findOne({_id : loanId}, function(err, result){     
                           // resolve({ "loanId": loanId, "amountRequested": result.amountRequested, "totalVouchAmount": result.totalVouchAmount});
                        //}); 
                        }
                            
                    });


     
            }
        });
    });

    resolve(1);  
    }
    }
    });
    });

};


exports.removeUsersFromGroup = (groupData)=>{
    return new Promise( (resolve, reject)=> {
        var groupId = groupData.groupId;
        var userIds = groupData.userIds;
        
    
        groupSession.findOne ({ _id : groupId}, function( err, group ){
            if( group == undefined || group == null ){
                resolve('group_not_found'); 
            }
       else{
        if(Array.isArray(userIds)){
            console.log("userIds", userIds);
            userIds.forEach(userId => {
            
           
            const users = mongoose.model('Users');
            users.findOne ({_id : userId}, function( err, userData ){
            if( userData == undefined || userData == null ){
                //user not exist
            }  
            else{
                let groupUsers = group.groupUsers;      
                let obj = groupUsers.find(o => o.userId  == userId);
                if(obj != undefined ){
                    groupUsers.splice(groupUsers.indexOf(obj), 1);                               
                }
                var updateObject = {'groupUsers': groupUsers}; 

                groupSession.update({ _id  : groupId}, {$set: updateObject},
                    function (err, result){
                        if(result){   
                           
                            //loanSession.findOne({_id : loanId}, function(err, result){     
                           // resolve({ "loanId": loanId, "amountRequested": result.amountRequested, "totalVouchAmount": result.totalVouchAmount});
                        //}); 
                        }
                            
                    });


     
            }
        });
    });

    resolve(1);  
    }
    }
    });
    });

};



exports.updateGroupDetails = (groupId, groupData) => {
    return new Promise((resolve, reject) => {
        groupSession.findById(groupId, function (err, group) {
            if(group == null ){
                resolve("group_not_found");         
            }
            else{
            
                if(groupData.groupImage != undefined){
                    groupData.groupImage = config.group_image_path+groupData.groupImage;
                }
            groupData.updated_at = new Date();
            for (let i in groupData) {
                group[i] = groupData[i];
            }
            group.save(function (err, updatedGroup) {
                if (err) return reject(err);
                resolve(updatedGroup);
            });
         }
        });
    
    });

};






