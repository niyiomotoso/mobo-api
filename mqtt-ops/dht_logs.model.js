const mongoose = require('mongoose');
mongoose.connect("mongodb://mobo_user:Happy1234@ds029817.mlab.com:29817/mobodb");
const Schema = mongoose.Schema;
const logSchema = new Schema({
    temperature: String,
    humidity: String,
    device_id: String,
}, {timestamps: true});

logSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

logSchema.findById = function (cb) {
    return this.model('logs').find({id: this.id}, cb);
};

const Log = mongoose.model('logs', logSchema);

exports.addLog = (logData) => {
    var temperature = logData.temperature;
    var humidity = logData.humidity;
    var device_id = logData.device_id;
    return new Promise( (resolve, reject)=> {
        let session = {"temperature": temperature, "humidity": humidity,  "device_id": device_id};
        const log = new Log(session);
        log.save(
                function(err, newLog){  
                    resolve("success");
        });
    }); 
    };
