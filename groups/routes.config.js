const GroupController = require('./controllers/group.controller');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

var storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/group_pictures'),
    filename: function (req, file, cb) {
    crypto.randomBytes(10, function(err, buffer) {
        cb(null, new Date().getTime()+buffer.toString('hex') + path.extname(file.originalname));
    });
}
});

const upload = multer({
    storage: storage,
}
);

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
    app.get('/groups/:groupId/get_group_details', [ 
        GroupController.getUserGroups
     ]);
    app.get('/groups/:phone/get_user_groups_by_phone', [ 
        GroupController.getUserGroupsByPhone
     ]);
    
    app.post('/groups/:groupId/update_group_details', upload.single('groupImage'), [ 
        GroupController.updateGroupDetails
     ]);
    
    
};