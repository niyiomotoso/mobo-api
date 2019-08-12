const ProjectController = require('./controllers/project.controller');

exports.routesConfig = function (app) {
    app.post('/projects/make_project_request', [
        ProjectController.makeProjectRequest
    ]);

    app.post('/projects/add_contribution_to_project', [
        ProjectController.addContributionToProject
    ]);

    app.get('/projects/:userId/get_user_projects', [ 
       ProjectController.getUserProjects
    ]);
    
    // app.get('/projects/:userId/get_maximum_amount', [
      
    //     ProjectController.getMaximumProject
    // ]);
    
};