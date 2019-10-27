const ProjectController = require('./controllers/project.controller');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const config = require('../common/config/env.config');
var FTPStorage = require('multer-ftp')
// var storage = multer.diskStorage({
//     destination: path.join(__dirname, '../public/project_pictures'),
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
      basepath: config.project_image_path,
      ftp: {
        host: 'ftp.leap.ng',
        secure: false, // enables FTPS/FTP with TLS
        user: 'ftpuser@leap.ng',
        password: '[^B66WQ}KjK;'
      }
    })
  })

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