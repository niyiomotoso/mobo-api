const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);
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



exports.findByUserId = (id) => {
    return Assessment.findOne({"userId": id})
        .then((result) => {
          
            if(result == undefined  || result == null)
                return {};
            else
            return result;
        });
};



exports.createAssessment = (userData) => {
    const user = mongoose.model('Users');
    return new Promise((resolve, reject) => {
       user.findOne ({ _id : userData.userId}, function( err, portfolio ){
        if( portfolio == undefined || portfolio == null ){
            resolve('user_not_found'); 
        }else{
    const assessment = new Assessment(userData);
    resolve(assessment.save());
   }
});});
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

exports.getMemebershipFee = (userId) => {
    return new Promise((resolve, reject) => {
       // var fees = [200, 4200, 750];
       const user = mongoose.model('Users');
       user.findOne ({ _id : userId}, function( err, portfolio ){
        if( portfolio == undefined || portfolio == null ){
            resolve('user_not_found'); 
        }else{
            var category = "PLACEHOLDER";
            Assessment.findOne ({ userId : userId}, function( err, assessment ){
                if( assessment == undefined || assessment == null ){
                    resolve('assessment_not_found'); 
                }else{
                var questions_and_answers = assessment.questions_and_answers;
                console.log(questions_and_answers);
                if( questions_and_answers[1] != undefined &&  questions_and_answers[1].answer1 != undefined){
                category = questions_and_answers[1].answer1;
            }
        
            var categoryObject = {"EMPLOYEE":1686,
            "STUDENT":986,
            "UNEMPLOYED":986,
            "SMALL BUSINESS OWNER":1686,
            "EMPLOYER OF LABOUR":3860,
            "CONTRACTOR/FREELANCE": 1686
            };
            resolve(categoryObject[category]);
        }

        });
    }
    });
    });
};


exports.getMemebershipStatus = (userId) => {
    return new Promise((resolve, reject) => {
       // var fees = [200, 4200, 750];
       const user = mongoose.model('Users');
       user.findOne ({ _id : userId}, function( err, portfolio ){
        if( portfolio == undefined || portfolio == null ){
            resolve('user_not_found'); 
        }else{
            var category = "PLACEHOLDER";
            Assessment.findOne ({ userId : userId}, function( err, assessment ){
                if( assessment == undefined || assessment == null ){
                    resolve('assessment_not_found'); 
                }else{
                var questions_and_answers = assessment.questions_and_answers;
                console.log(questions_and_answers);
                if( questions_and_answers[1] != undefined &&  questions_and_answers[1].answer1 != undefined){
                category = questions_and_answers[1].answer1;
            }
                resolve(category);
            }
        });
    }
    });
    });
};

