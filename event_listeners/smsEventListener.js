var common = require('../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
const axios = require('axios')
var UserPortfolioModel = require('../users/models/users_portfolio.model');
var UserModel = require('../users/models/users.model');


commonEmitter.on('new_financial_partner_sms_event', function( phone, sender_fullname) {
    setImmediate(() => {
       
        var sender = 'LEAP APP';
      
        var message = 'Hi, '+sender_fullname+' has requested you to be his financial patner on Leap App, please login/signup to confirm';
        axios.get('http://api.ebulksms.com:8080/sendsms?username=scholar4real05@yahoo.com&apikey=2e91a0faf31ae5bef7547a941b0e38cc0e6fe837&sender='+sender+'&messagetext='+message+'&flash=0&recipients='+phone)
            .then(response => {
                console.log(response.data);
              
            })
            .catch(error => {
                console.log(error);
            });

        });
  
   });

   commonEmitter.on('new_user_for_verification', function( phone, verificationCode) {
    setImmediate(() => {
       
        var sender = 'LEAP APP';
      
        var message = 'Please enter the verification Code '+verificationCode+' to complete your profile setup now';
        axios.get('http://api.ebulksms.com:8080/sendsms?username=scholar4real05@yahoo.com&apikey=2e91a0faf31ae5bef7547a941b0e38cc0e6fe837&sender='+sender+'&messagetext='+message+'&flash=0&recipients='+phone)
            .then(response => {
                console.log(response.data);
              
            })
            .catch(error => {
                console.log(error);
            });

        });
  
   });

   commonEmitter.on('new_user_reset_pin', function( phone, verificationCode) {
    setImmediate(() => {
       
        var sender = 'LEAP APP';
      
        var message = 'Hello, kindly use '+verificationCode+' as your verification PIN to reset your password';
        axios.get('http://api.ebulksms.com:8080/sendsms?username=scholar4real05@yahoo.com&apikey=2e91a0faf31ae5bef7547a941b0e38cc0e6fe837&sender='+sender+'&messagetext='+message+'&flash=0&recipients='+phone)
            .then(response => {
                console.log(response.data);
              
            })
            .catch(error => {
                console.log(error);
            });

        });
  
   });

   
   commonEmitter.on('new_referral_sms_event', function( phone, sender_fullname) {
    setImmediate(() => {
        var sender = 'LEAP APP';
      
        var message = 'Hi, '+sender_fullname+' has just invited you to use Leap App, please login/signup to start..';
        axios.get('http://api.ebulksms.com:8080/sendsms?username=scholar4real05@yahoo.com&apikey=2e91a0faf31ae5bef7547a941b0e38cc0e6fe837&sender='+sender+'&messagetext='+message+'&flash=0&recipients='+phone)
            .then(response => {
                console.log(response.data);
              
            })
            .catch(error => {
                console.log(error);
            });

        });
  
   });

   commonEmitter.on('new_loan_request_sms_event', function( userId, amount) {
    setImmediate(() => {

        UserModel.findById(userId).then((result) => {
            sender_fullname = result.firstName+ " "+result.lastName;
      
            UserPortfolioModel.getUserPartners(userId).then (partners => {
            partners.forEach(partner => {
                partner_name = partner.firstName;
                partner_phone = partner.phone;
                var sender = 'LEAP APP';
      
                var message = "Hi "+partner_name+", your Financial Partner - "+ sender_fullname+" is in need of an emergency fund. Please Vouch for him by pressing the Pink button below."
                axios.get('http://api.ebulksms.com:8080/sendsms?username=scholar4real05@yahoo.com&apikey=2e91a0faf31ae5bef7547a941b0e38cc0e6fe837&sender='+sender+'&messagetext='+message+'&flash=0&recipients='+partner_phone)
                    .then(response => {
                        console.log(response.data);
                      
                    })
                    .catch(error => {
                        console.log(error);
                    });

                });



        });
    });

    });
   });
   