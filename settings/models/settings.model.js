const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
mongoose.connect("mongodb://mobo_user:Happy1234@ds029817.mlab.com:29817/mobodb");
const Schema = mongoose.Schema;
const settingsSchema = new Schema({
    status:String,
    platform: String,
    api_key: String,
    api_url: String,
    api_secret: String,
    webhook: String
}, {timestamps: true});

settingsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

settingsSchema.findById = function (cb) {
    return this.model('settings').find({id: this.id}, cb);
};

const Settings = mongoose.model('settings', settingsSchema);

exports.addConfig = (settingsData) => {
    var platform = settingsData.platform;
    var api_key = settingsData.api_key;
    var api_secret = settingsData.api_secret;
    var webhook = settingsData.webhook;
    var api_url = settingsData.api_url;
 
    return new Promise( (resolve, reject)=> {
      
        let session = {"api_key": api_key, "api_secret": api_secret,  "webhook": webhook, "api_url": api_url, "platform":  platform};
        const setting = new Settings(session);
        setting.save(
                function(err, newSetting){  
                    resolve(newSetting);
        });
    }); 
    };


exports.getAll = () => {
    return new Promise((resolve, reject) => {
        Settings.find()
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};


