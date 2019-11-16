const LoanController = require('./controllers/loan.controller');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

exports.routesConfig = function (app) {
    app.post('/loans/make_loan_request', [
        LoanController.makeLoanRequest
    ]);

    app.post('/loans/add_vouch_to_loan', [
        LoanController.addVouchToLoan
    ]);

    app.post('/loans/payback_loan', [
        LoanController.paybackLoan
    ]);

    app.get('/loans/:userId/get_user_loans', [ 
       LoanController.getUserLoans
    ]);

    app.patch('/loans/:loanId/update_loan_status', [ 
        LoanController.updateLoanStatus
     ]);
    
    app.get('/loans/:userId/get_maximum_amount', [
      
        LoanController.getMaximumLoan
    ]);
    
};