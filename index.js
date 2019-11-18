const config = require('./common/config/env.config.js');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const UsersRouter = require('./users/routes.config');
const SettingsRouter = require('./settings/routes.config');
const mqtt = require('./mqtt-ops/mqtt-receiver');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//UsersRouter.routesConfig(app);

SettingsRouter.routesConfig(app);


var server_port = process.env.PORT || config.port;
app.listen(server_port, function() {
    console.log('Listening on port %d', server_port);
});

// app.listen(config.port, function () {
//     console.log('app listening at port %s', config.port);
// });
