const ProjectModel = require('../models/project.model');
const response = require('../../common/jsonResponse');



// exports.getMaximumProject = (req, res) => {
//     ProjectModel.getMaximumProject(req.params.userId)
//         .then((result) => {
//             res.status(200).send(response.success(result, "Loaded Successfully"));
        
//         });
// };

exports.getUserProjects = (req, res) => {
    ProjectModel.getUserProjects(req.params.userId)
        .then((result) => {
            res.status(200).send(response.success(result, "Loaded Successfully"));
        
        });
};


exports.addContributionToProject = (req, res) => {
    if(req.body.amount == undefined || req.body.projectId  == undefined  || req.body.contributorUserId  == undefined  ){
        res.status(200).send(response.failure("incomplete_params" ,"incomplete parameter set"));
    }
    else{
        ProjectModel.addContributionToProject(req.body)
            .then((result) => {
                if(result == 'project_id_not_found'){
                    res.status(200).send(response.failure("project_not_found", "Project session not found"));
                }else if(result == 'user_not_found'){
                    res.status(200).send(response.failure("user_not_found", "contributor not found"));
                }
                else if(result == 'requested_amount_exceeded'){
                    res.status(200).send(response.failure( "requested_amount_exceeded","requested amount exceeded by new contribution"));
                }
                else if(result == 'contributor_insufficient_balance'){
                    res.status(200).send(response.failure("contributor_insufficient_balance","insufficient balance in contributor account"));
                }
                
                
                else{
                res.status(200).send(response.success(result, "Loaded Successfully"));
            }
            
            });
    }
};

exports.makeProjectRequest = (req, res) => {

    if(req.body.userId == undefined || req.body.targetAmount  == undefined || req.body.targetMode == undefined){
        res.status(200).send(response.failure("incomplete_params", "incomplete parameter set"));
    }else if(req.body.targetMode == "TIME_TARGET" && req.body.targetTime == undefined){
        res.status(200).send(response.failure("time_target_not_set", "targetTime not set for TIME_TARGET mode"));
    }
    else if(req.body.targetMode != "TIME_TARGET"  && req.body.targetMode  != "MONEY_TARGET" && req.body.targetMode  != "ANYTIME"){
        res.status(200).send(response.failure("invalid_target_mode", "invalid target mode"));
    }
    else{
        ProjectModel.makeProjectRequest(req.body)
            .then((result) => {
                if(result == 'limit_exceeded'){
                    res.status(200).send(response.failure("limit_exceeded", "Project limit exceeded"));
                }
                else{
                res.status(200).send(response.success(result, "Loaded Successfully"));
            }
            
            });
    }
};
