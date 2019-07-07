var common = require('../common/generalEventEmitter.js');
var commonEmitter = common.commonEmitter;
const axios = require('axios')


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

   