const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
mongoose.connect(config.MONGO_URL);
const Schema = mongoose.Schema;

const assessmentSchema = new Schema({
    userId: String,
    questions_and_answers: Array,
    
}, {timestamps: true});

assessmentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
assessmentSchema.set('toJSON', {
    virtuals: true
});

assessmentSchema.findById = function (cb) {
    return this.model('Assessments').find({id: this.id}, cb);
};

const Assessment = mongoose.model('Assessments', assessmentSchema);



exports.findById = (id) => {
    return Assessment.find({"userId": id})
        .then((result) => {
            // result = result.toJSON();

            //  delete result[0]._id;
            //  delete result[0].__v;
            if(result == undefined  || result == null)
                return {};
            else
            return result[0];
        });
};



exports.createAssessment = (userData) => {
    const assessment = new Assessment(userData);
    return assessment.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Assessment.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchAssessment = (userId, userData) => {
    return new Promise((resolve, reject) => {

        Assessment.remove({userId: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });

        const assessment = new Assessment(userData);
        return assessment.save();
    })

};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        Assessment.remove({userId: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

