const GroupController = require('./controllers/group.controller');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../common/config/env.config');
var FTPStorage = require('multer-ftp')
// var storage = multer.diskStorage({
//     destination: path.join(__dirname, '../public/group_pictures'),
//     filename: function (req, file, cb) {
//     crypto.randomBytes(10, function(err, buffer) {
//         cb(null, new Date().getTime()+buffer.toString('hex') + path.extname(file.originalname));
//     });
// }
// });

// const upload = multer({
//     storage: storage,
// }
// );
var upload = multer({
    storage: new FTPStorage({
      basepath: config.group_image_path,
      ftp: {
        host: 'ftp.leap.ng',
        secure: false, // enables FTPS/FTP with TLS
        user: 'ftpuser@leap.ng',
        password: '[^B66WQ}KjK;'
      }
    })
  })

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