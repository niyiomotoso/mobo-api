const config = require('../../common/config/env.config.js');
const mongoose = require('mongoose');
const https = require('https')
const EventEmitter = require('events');
var common = require('../../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
var smsEventListener = require('../../event_listeners/smsEventListener.js');
var moment = require('moment');
const UserPortfolioModel = require('../../users/models/users_portfolio.model');
const UserModel = require('../../users/models/users.model');
mongoose.connect(config.MONGO_URL);
const Schema = mongoose.Schema;

const paymentSessionSchema = new Schema({
    userId: String,
    //PENDING e.t.c
    status:String,
    channel: String,
    amount: String,
    reference: String
    
}, {timestamps: true});

paymentSessionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
paymentSessionSchema.set('toJSON', {
    virtuals: true
});

paymentSessionSchema.findById = function (cb) {
    return this.model('paymentSession').find({id: this.id}, cb);
};

const paymentSession = mongoose.model('paymentSession', paymentSessionSchema);

exports.logPayment = (paymentData) => {
    var userId = paymentData.userId;
    var reference = paymentData.reference;
    var amount = paymentData.amount;

    const users = mongoose.model('Users');
    let parent = this;
    return new Promise( (resolve, reject)=> {
      users.findOne ( {_id: userId}, function( err, userData ){
       if( userData == undefined || userData == null ){
            resolve('user_not_found'); 
       }else{
        let session = {"userId": userId, "reference": reference, "amount": amount, "status": "PENDING", "channel": "PAYSTACK_ONLINE"};
        const payment = new paymentSession(session);
        payment.save(
                function(err, savedSession){  
        
                    const options = {
                    hostname: 'api.paystack.co',
                    port: 443,
                    path: '/transaction/verify/'+reference,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'BEARER sk_test_a3444f7e4420ec600be5b0fec811136c5da8ebb1'
                      }
                    }

                    const req = https.request(options, (res) => {
                    console.log(`statusCode: ${res.statusCode}`)

                    res.on('data', (d) => {
                        process.stdout.write(d)
                    })
                    });

                    req.on('error', (error) => {
                    console.error(error)
                    });

                    req.end()

                   resolve(savedSession);
                        });
            }                 
        });
         });
     
};

exports.makePaymentRequest = (paymentData)=> {



    var userId=  paymentData.userId;
    var targetAmount =  paymentData.targetAmount;
    var totalContributedAmount  = 0;
    var targetMode = paymentData.targetMode;
    var targetTime = paymentData.targetTime;
    var paymentName = paymentData.paymentName;
    var status =  'ACTIVE';
    var contributions = [];
    var withdrawals = [];
    var paymentType = paymentData.paymentType;
    var coverImage =  '';
    if(paymentData.coverImage != undefined){
        coverImage = config.payment_image_path+paymentData.coverImage;
    }

    let session = {"userId": userId, "targetAmount": targetAmount, "targetMode":
        targetMode, "targetTime" : targetTime, "totalContributedAmount": totalContributedAmount,
        "status": status, "contributions": contributions, "withdrawals": withdrawals, "paymentName": paymentName,
        "paymentType": paymentType, "coverImage" : coverImage
     };
  //   var maximumAllowed =  this.getMaximumPayment(userId);

    const payment = new paymentSession(session);
    // if( parseFloat(maximumAllowed) < parseFloat(targetAmount) ){
    //     return 'limit_exceeded';
    // }else{
    return new Promise ( ( resolve, reject) => {
        payment.save(
            function(err, savedSession){
                resolve(savedSession);
            }
        );
        }
    )

};


exports.getUserPayments = (req)=>{
    var userId = req.params.userId;
    var paymentType = req.query.paymentType;

    return new Promise( (resolve, reject)=> {

        if(paymentType != undefined){
            paymentSession.find ({"userId" : userId, "paymentType": paymentType}, function( err, result ){
                resolve(result);
            });
        }else{
            paymentSession.find ({"userId" : userId}, function( err, result ){
                resolve(result);
            });
        }


    });

};

exports.addContributionToPayment = (paymentData)=>{
    return new Promise( (resolve, reject)=> {
        var paymentId = paymentData.paymentId;
        var userId = paymentData.contributorUserId;
        var amount = paymentData.amount;

        const UserPortfolio = mongoose.model('UserPortfolio');

        UserPortfolio.findOne ({ userId : userId}, function( err, portfolio ){
            if( portfolio == undefined || portfolio == null ){
                resolve('user_not_found'); 
            }
            else if( parseFloat(portfolio.balance) < parseFloat(amount) ){
                resolve('contributor_insufficient_balance'); 
            }
       else{
        
        paymentSession.findOne ({_id : paymentId}, function( err, paymentData ){
            if( paymentData == undefined || paymentData == null )
              resolve('payment_id_not_found');
            else{
 
            let contributions = paymentData.contributions;
           
            var dateTime =  Date.now();
            dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
            

            var totalContributedAmountAfterNewContribution =  parseFloat(paymentData.totalContributedAmount) + parseFloat( amount);
            
            if(totalContributedAmountAfterNewContribution > parseFloat(paymentData.targetAmount) ){
                resolve('requested_amount_exceeded');
            }
            else{
                // let obj = contributions.find(o => o.userId  == userId);

                // if(obj != undefined ){
                  //if already exist, removed the current from the newly added
                //    contributions.splice(contributions.indexOf(obj), 1);
                  
                //    var totalContributedAmount =  totalContributedAmountAfterNewContribution - parseFloat(obj.amount);
                //    contributions.push({ "userId": userId, "amount": amount, "status": 1, "createdAt": dateTime});                   
                // }else{
            var totalContributedAmount =  totalContributedAmountAfterNewContribution;
            contributions.push({ "userId": userId, "amount": amount, "status": 1, "createdAt": dateTime});     
                                            
                    //}

                var updateObject = {'contributions': contributions, 'totalContributedAmount': totalContributedAmount}; 

                paymentSession.update({ _id  : paymentId}, {$set: updateObject},
                    function (err, paymentSessionresult){
                        if(paymentSessionresult){     
                            //deduct from contributor's balance
                            var newBalance = parseFloat(portfolio.balance) - parseFloat(amount);
                            var updateObject = {'balance': newBalance}; 
                            UserPortfolio.update({ userId  : userId}, {$set: updateObject},
                                function (err, portfolioUpdateResult){
                                    if(portfolioUpdateResult){  
                                        paymentSession.findOne({_id : paymentId}, function(err, result){     
                                        resolve({ "paymentId": paymentId, "targetAmount": result.targetAmount, "totalContributedAmount": result.totalContributedAmount});
                        }); 
                        }
                            
                    });
                    }
                            
            });

            }
     
            }
        });
    }
    });
    });

};






