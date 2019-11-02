const ProjectController = require('./controllers/project.controller');
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
    app.post('/projects/make_project_request', upload.single('coverImage'), [
        ProjectController.makeProjectRequest
    ]);

    app.post('/projects/add_contribution_to_project', [
        ProjectController.addContributionToProject
    ]);

    app.get('/projects/:userId/get_user_projects', [ 
       ProjectController.getUserProjects
    ]);
    app.get('/projects/:projectId/get_project_details', [ 
        ProjectController.getProjectDetails
     ]);

    app.post('/projects/:projectId/update_project_status', [ 
        ProjectController.updateProjectStatus
     ]);
    
    // app.get('/projects/:userId/get_maximum_amount', [
      
    //     ProjectController.getMaximumProject
    // ]);
    
};