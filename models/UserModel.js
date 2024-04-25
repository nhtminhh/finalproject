var mongoose = require('mongoose');
var UserSchema = mongoose.Schema(
   {
    name: {
        type: String,
        required: true
    },
    
    dob: {
        type: Date,
        required: true

    },
    gender: {
        type: String,
        required: true

    },
    address: {
        type: String,
        required: true

    },
    email: {
         type: String,
         unique: true,
         required: true
      },
    password: {
         type: String,
         required: true
      },
    role: {
         type: String
      }
   }
);
var UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;