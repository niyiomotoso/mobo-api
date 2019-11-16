const AssessmentController = require('./controllers/assessment_question.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

exports.routesConfig = function (app) {
    app.post('/assessment_questions', [
        AssessmentController.insert
    ]);
    app.get('/assessment_questions', [
        AssessmentController.list
    ]);
    app.get('/assessment_questions/:userId', [
       
        AssessmentController.getByUserId
    ]);
    app.get('/assessment_questions/:userId/get_membership_fee', [
       
        AssessmentController.getMemebershipStatus
    ]);
    app.patch('/assessment_questions/:userId', [
        
        AssessmentController.patchByUserId
    ]);
    app.delete('/assessment_questions/:userId', [
      
        AssessmentController.removeByUserId
    ]);
};