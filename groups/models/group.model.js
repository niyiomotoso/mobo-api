const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');

const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
mongoose.connect(process.env.MONGO_URL);
const Schema = mongoose.Schema;

const groupSessionSchema = new Schema({
    // creatorUserId: String,
    creatorUserId: {
        type: mongoose.Schema.Types.ObjectId,                             
        ref: 'Users'
      },
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
        //groupImage = config.cdn_path+groupData.groupImage;
        groupImage = groupData.groupImage;
    }
    var dateTime =  Date.now();
    dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
    let session = {"name": name, "creatorUserId": creatorUserId, "description":
        description,"status": status,  "groupImage" : groupImage, "groupUsers": [{ "userId": creatorUserId,  "createdAt": dateTime}]
        };
 
    const group = new groupSession(session);
    const user  = mongoose.model('Users');
    return new Promise ( ( resolve, reject) => {

        user.findOne({'_id': creatorUserId}, function(err, data) {
            if( data == null || data.length == 0 ){
                resolve('user_not_found');
            }else{
        group.save(
            function(err, savedSession){
                resolve(savedSession);
            }
        );
        }
    }
    );
    });
};

exports.getGroupDetails = (groupId)=>{
  
    return new Promise( (resolve, reject)=> {
       
                groupSession.findOne({'_id': groupId}, function(err, group) {
                    if( group == null || group.length == 0 ){
                        resolve('group_not_found');
                    }else{
                            var user_ids = Array();
                            if( group != null && Array.isArray(group.groupUsers) ){
                                group.groupUsers.forEach(user_data =>{
                                    user_ids.push(user_data.userId);
                                });
                            } 
                        group = group.toObject();
                        const user = mongoose.model("Users");
                        user.findOne({'_id': group.creatorUserId}, function(err, groupOwner){
                        group.owner = groupOwner;
                        getUserDetailsFromArray('_id', user_ids).then(function(usersDetails){
                        
                            group.groupUsers = usersDetails;
                            const projects = mongoose.model("projectSession");
                            
                            projects.aggregate([
                                
                                {
                                  $match:{groupId : group._id,projectType : 'GROUP' }
                                 },
                               
                                {
                                   $lookup:
                                   {
                                       from: "users",
                                       localField: "userId",
                                       foreignField: "_id",
                                       as: "owner"
                                   }
                                  },
                                    {$unwind: '$owner'}
                                
                                ]).exec().then((data) => {
                                    console.log("data",data);
                                      
                                    group.projects = data;
                                       resolve(group);
                                  }).catch((err) => {
                                    console.error("err",err);
                                  });
                                
                        
});
});
}  
    });
});

};

function getGroupDetails(groupId){
  
    return new Promise( (resolve, reject)=> {
       
                groupSession.findOne({'_id': groupId}, function(err, group) {
                    if( group == null || group.length == 0 ){
                        resolve('group_not_found');
                    }else{
                            var user_ids = Array();
                            if( group != null && Array.isArray(group.groupUsers) ){
                                group.groupUsers.forEach(user_data =>{
                                    user_ids.push(user_data.userId);
                                });
                            }
                        
                        group = group.toObject();
                        const user = mongoose.model("Users");
                        user.findOne({'_id': group.creatorUserId}, function(err, groupOwner){
                        group.owner  = groupOwner;
                        getUserDetailsFromArray('_id', user_ids).then(function(usersDetails){
                        
                            group.groupUsers = usersDetails;
                            const projects = mongoose.model("projectSession");
                         
                                
                          
                            projects.aggregate([
                                
                                {
                                    $match:{groupId : group._id , projectType : 'GROUP'}
                                },
                               
                                {
                                   $lookup:
                                   {
                                       from: "users",
                                       localField: "userId",
                                       foreignField: "_id",
                                       as: "owner"
                                   }
                                  },
                                    {$unwind: '$owner'}
                                
                                ]).exec().then((data) => {
                                    console.log("data",data);
                                      
                                    group.projects = data;
                                       resolve(group);
                                  }).catch((err) => {
                                    console.error("err",err);
                                  });
                        
});});
}  
    });
});

};


exports.getUserGroupsByPhone = (req)=>{
    var phone = req.params.phone;
    
    return new Promise( (resolve, reject)=> {
        const users = mongoose.model("Users");
        users.findOne ( { phone : phone}, function( err, portfolio ){
            if( portfolio == undefined || portfolio == null ){
                 resolve('user_not_found'); 
            }else{
                portfolio = portfolio.toObject();
                let id = portfolio._id;
                groupSession.find({'groupUsers.userId': String(id)}, function(err, groups) {
                    var counter = 0;
                    //console.log("groups",groups);
                    if( groups == null || groups.length == 0 ){
                        resolve('group_not_found');
                    }else{

                   
                    groups.forEach((group, group_index )=> {
                        var user_ids = Array();
                        groups[group_index] = groups[group_index].toObject();
                        if( group != null && Array.isArray(group.groupUsers) ){
                            group.groupUsers.forEach(user_data =>{
                            
                                user_ids.push(user_data.userId);
                            });
                        }
                        const user = mongoose.model("Users");
                        user.findOne({'_id': group.creatorUserId}, function(err, groupOwner){
                        groups[group_index].owner = groupOwner;

                        getUserDetailsFromArray('_id', user_ids).then(function(usersDetails){
                        
                            groups[group_index].groupUsers = usersDetails;
                            //console.log("usersDetails", usersDetails);
                            const projects = mongoose.model("projectSession");
                            const usr = mongoose.model("Users");

                            projects.aggregate([
                                
                                {
                                  $match:{groupId : group._id , projectType : 'GROUP'}
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
                               
                                ]).exec().then((data) => {
                                    console.log("data",data);
                                      
                                       groups[group_index].projects = data;
                                       resolve(groups);
                                  }).catch((err) => {
                                    console.error("err",err);
                                  });

                           

                           

                });

            });
        });
        }
        });
        
    }
});
       
    });
};

function getUserDetailsFromArray(field_to_search, fieldArray){
    
    return new Promise((resolve, reject) => {
            const Users = mongoose.model('Users');
            userDArray = [];    
            field_to_search = field_to_search.toString();     
            Users.find({ '_id' : { $in: fieldArray } }, 'firstName lastName phone profilePicPath'  )
             .exec(function(err, userDArray) {
                resolve(userDArray);
            });
           
    });
}

exports.addUsersToGroup = (groupData)=>{
    return new Promise( (resolve, reject)=> {
        var groupId = groupData.groupId;
        var phones = groupData.phones;
        
    
        groupSession.findOne ({ _id : groupId}, function( err, group ){
            if( group == undefined || group == null ){
                resolve('group_not_found'); 
            }
       else{
        if(Array.isArray(phones) && phones.length > 0){
            console.log("phones", phones);
            var counter = 0;
            phones.forEach(phone => {
            
           
            const users = mongoose.model('Users');
            users.findOne ({phone : phone}, function( err, userData ){
            if( userData == undefined || userData == null ){
                //user not exist
                counter++;
                if(counter == phones.length){
                    resolve(getGroupDetails(groupId));
                }
            }  
            else{
                var userId = String(userData._id);
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
                             counter++;
                            if(counter == phones.length){
                                resolve(getGroupDetails(groupId));
                            }
                        }
                            
                    });


     
            }
        });
    });

    }else{
        resolve(getGroupDetails(groupId));
    }
    }
    });
    });

};


exports.removeUsersFromGroup = (groupData)=>{
    return new Promise( (resolve, reject)=> {
        var groupId = groupData.groupId;
        var phones = groupData.phones;
        
    
        groupSession.findOne ({ _id : groupId}, function( err, group ){
            if( group == undefined || group == null ){
                resolve('group_not_found'); 
            }
       else{
        if(Array.isArray(phones) && phones.length > 0){
            console.log("phones", phones);
            var counter = 0;
            phones.forEach(phone => {
            
           
            const users = mongoose.model('Users');
            users.findOne ({phone : phone}, function( err, userData ){
            if( userData == undefined || userData == null ){
               //user not exist
               counter++;
               if(counter == phones.length){
                   resolve(getGroupDetails(groupId));
               }
            }  
            else{
                var userId = String(userData._id);

                let groupUsers = group.groupUsers;      
                let obj = groupUsers.find(o => o.userId  == userId);
                if(obj != undefined ){
                    groupUsers.splice(groupUsers.indexOf(obj), 1);                               
                }
                var updateObject = {'groupUsers': groupUsers}; 

                groupSession.update({ _id  : groupId}, {$set: updateObject},
                    function (err, result){
                        if(result){   
                            counter++;
                           if(counter == phones.length){
                               resolve(getGroupDetails(groupId));
                           }
                       }
                            
                    });


     
            }
        });
    });

    }else{
        resolve(getGroupDetails(groupId));
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
                    groupData.groupImage = config.cdn_path+groupData.groupImage;
                }
            groupData.updated_at = new Date();
            for (let i in groupData) {
                group[i] = groupData[i];
            }
            group.save(function (err, updatedGroup) {
                if (err) return reject(err);
                resolve(getGroupDetails(groupId));
            });
         }
        });
    
    });

};






