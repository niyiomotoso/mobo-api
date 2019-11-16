const GroupController = require('./controllers/group.controller');
const multer = require('multer');
const config = require('../common/config/env.config');
const path = require('path');
const crypto = require('crypto');
var AWS = require('aws-sdk');
var multerS3 = require('multer-s3');

 
AWS.config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  });

var s3 = new AWS.S3();
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'leapuploads',
    metadata: function (req, file, cb) {
       cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        crypto.randomBytes(10, function(err, buffer) {
            cb(null, new Date().getTime()+buffer.toString('hex') + path.extname(file.originalname));
        });
    }
  })
});

exports.routesConfig = function (app) {
    app.post('/groups/create_group', upload.single('groupImage'), [
        GroupController.makeGroupRequest
    ]);

    app.post('/groups/add_users_to_group', [
        GroupController.addUsersToGroup
    ]);

    app.post('/groups/remove_users_from_group', [
        GroupController.removeUsersFromGroup
    ]);

    app.get('/groups/:userId/get_user_groups', [ 
       GroupController.getUserGroups
    ]);
    // app.get('/groups/:groupId/get_group_details', [ 
    //     GroupController.getUserGroupsByPhone
    //  ]);
    app.get('/groups/:phone/get_user_groups_by_phone', [ 
        GroupController.getUserGroupsByPhone
     ]);
     app.get('/groups/:groupId/get_group_details', [ 
        GroupController.getGroupDetails
     ]);
     
    app.post('/groups/:groupId/update_group_details', upload.single('groupImage'), [ 
        GroupController.updateGroupDetails
     ]);
    
    
};