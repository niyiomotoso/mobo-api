const config = require('./common/config/env.config.js');
const MongoClient = require('mongodb').MongoClient
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dbName = process.env.NODE_ENV === 'dev' ? 'leap-test' : 'leap' 
const url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${dbName}?authMechanism=SCRAM-SHA-1&authSource=admin`
const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');

const options = {
    useNewUrlParser: true, 
    reconnectTries: 60, 
    reconnectInterval: 1000
}

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
const http = require('http').Server(app)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
// app.use('/api', routes)

AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);

// MongoClient.connect(url, options, (err, database) => {
//     if (err) {
//       console.log(`FATAL MONGODB CONNECTION ERROR: ${err}:${err.stack}`)
//       process.exit(1)
//     }
//     app.locals.db = database.db('api')
//     http.listen(config.port, () => {
//       console.log("Listening on port " + config.port)
//       app.emit('APP_STARTED')
//     })
//   });

var server_port = process.env.PORT || config.port;
app.listen(server_port, function() {
    console.log('Listening on port %d', server_port);
});

// app.listen(config.port, function () {
//     console.log('app listening at port %s', config.port);
// });
