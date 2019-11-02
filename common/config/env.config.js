const mongoUrl = process.env.NODE_ENV == 'dev' ? 'mongodb://mongo_user:mongo_password@database:27017' : 'mongodb://leap_user:Happy1234@ds157136.mlab.com:57136/leapdb';
module.exports = {
    "port": 3601,
    "appEndpoint": "http://localhost:3600",
    "apiEndpoint": "http://localhost:3600",
    "cdn_path":"http://leap.ng/DO_NOT_DELETE/uploads/",
    "profile_pic_path": "dp",
    "project_image_path": "projectImages",
    "group_image_path": "groupImages",
    "payment_image_path": "paymentImages",
    "jwt_secret": "myS33!!creeeT",
    "jwt_expiration_in_seconds": 36000000,
    "MONGO_URL": mongoUrl,
    "environment": "dev",
    "permissionLevels": {
        "NORMAL_USER": 1,
        "PAID_USER": 4,
        "ADMIN": 2048
    },
    "mailHost":'smtp.gmail.com',
    "mailUsername": "contactleapng@gmail.com",
    "mailPassword": "P@ssw0rdE360%%",
    "aws_key":"AKIAI3FUDKZOT6AQ5FOQ",
    "aws_secret":"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" 
};
