const SettingsModel = require('../models/settings.model');
const response = require('../../common/jsonResponse');


exports.addConfig = (req, res) => {
    if(req.body.platform == undefined || req.body.api_url == undefined ||
        req.body.api_key == undefined || req.body.api_secret == undefined ){
        res.status(200).send(response.failure("incomplete_params", "incomplete parameter set"));
    }
    
    SettingsModel.addConfig(req.body)
        .then((result) => {
                res.status(200).send(response.success("success", result));
        });
};



exports.getConfig = (req, res) => {
    SettingsModel.getConfig(req.params.configId)
        .then((result) => {
            res.status(200).send(response.success(result, "success"));
        
        });
};

exports.getAll = (req, res) => {
    SettingsModel.getAll(req)
        .then((result) => {
            res.status(200).send(response.success(result, "success"));
        
        });
};


