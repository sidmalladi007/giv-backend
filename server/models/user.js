let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String }
  },
  role: {
    type: String,
    enum: ['Donor', 'Charity'],
    default: 'Donor'
  },
  transactions: [{
    name: {type: String},
    amount: {type: String},
    change: {type: String},
  }],
  donations: [{
    amount: {type: Number},
    date: {type: String}
  }],
  authTokens: [{
    type: String
  }],
  connectTokens: [{
    type: String
  }],
  stripeCustomerID: {type: String},
  spareChange: {
    type: Number,
    default: 0
  },
  lastRefresh: {type: Date},
  charities: [{type: String}],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
},
{
  timestamps: true
});

UserSchema.pre('save', function(next) {
  let user = this;
  let SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return cb(err); }
    cb(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);
