const SettingsController = require('./controllers/settings.controller');

exports.routesConfig = function (app) {
    app.post('/settings', [
        SettingsController.addConfig
    ]);

    app.get('/settings/:configId/load_config', [ 
        SettingsController.getConfig
    ]);
    
    app.get('/settings', [ 
        SettingsController.getAll
     ]);
    
    
};