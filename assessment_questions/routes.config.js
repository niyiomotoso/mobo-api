const AssessmentController = require('./controllers/assessment_question.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.post('/assessment_questions', [
        ValidationMiddleware.validJWTNeeded,
        AssessmentController.insert
    ]);
    app.get('/assessment_questions', [
        ValidationMiddleware.validJWTNeeded,
      
        AssessmentController.list
    ]);
    app.get('/assessment_questions/:userId', [
        ValidationMiddleware.validJWTNeeded,
        
        AssessmentController.getByUserId
    ]);
    app.patch('/assessment_questions/:userId', [
        ValidationMiddleware.validJWTNeeded,
        
        AssessmentController.patchByUserId
    ]);
    app.delete('/assessment_questions/:userId', [
        ValidationMiddleware.validJWTNeeded,
       
        AssessmentController.removeByUserId
    ]);
};