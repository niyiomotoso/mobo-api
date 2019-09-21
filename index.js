const config = require('./common/config/env.config.js');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const dbName = process.env.NODE_ENV === 'test' ? 'leap-test' : 'leap';
// const url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${dbName}?authMechanism=SCRAM-SHA-1&authSource=admin`
const AuthorizationRouter = require('./authorization/routes.config');
const UsersRouter = require('./users/routes.config');
const AssessmentsRouter = require('./assessment_questions/routes.config');
const LoanRouter = require('./loans/routes.config');
 const ProjectRouter = require('./projects/routes.config');
 const PaymentRouter = require('./payments/routes.config');
 const GroupRouter = require('./groups/routes.config');
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
app.use('*/dp',express.static('public/profile_pictures'));
app.use('*/uploads',express.static('public/uploads'));
app.use('*/projectImages',express.static('public/project_pictures'));
app.use('*/paymentImages',express.static('public/payment_pictures'));
app.use('*/groupImages',express.static('public/group_pictures'));

AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);
AssessmentsRouter.routesConfig(app);
LoanRouter.routesConfig(app);
ProjectRouter.routesConfig(app);
PaymentRouter.routesConfig(app);
GroupRouter.routesConfig(app);
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
