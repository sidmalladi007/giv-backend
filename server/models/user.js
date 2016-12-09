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
    amount: {type: Number},
    change: {type: Number},
    date: {type: String}
  }],
  donations: [{
    amount: {type: Number},
    date: {type: Date}
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
  charities: [{name: String}],
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

UserSchema.statics.plaidPullContext = function(userID, cb) {
  User.findOne({'_id': userID}, 'connectTokens lastRefresh', cb);
}

UserSchema.statics.addTransactions = function(userID, transactionsToAdd, cb) {
  User.update({'_id': userID}, { $push: { transactions: { $each: transactionsToAdd } } }, cb);
}

UserSchema.statics.retrieveSpareChange = function(userID, cb) {
  User.findOne({'_id': userID}, 'spareChange', cb)
}

UserSchema.statics.updateSpareChange = function(userID, newChange, cb) {
  User.findOne({'_id': userID}, 'spareChange', function(err, result) {
    if (err) { console.log(err); }
    var updatedSpareChangeValue = result.spareChange + newChange;
    User.update({'_id': userID}, { $set: { spareChange: updatedSpareChangeValue }}, cb);
  });
}

UserSchema.statics.retrieveSavedTransactions = function(userID) {
  User.findOne({'_id': userID}, 'transactions', cb);
}

UserSchema.statics.insertPlaidAuthToken = function(userID, accessToken, cb) {
  User.update({'_id': userID}, { $push: { authTokens: accessToken }}, cb);
}

UserSchema.statics.insertPlaidConnectToken = function(userID, accessToken, cb) {
  User.update({'_id': userID}, { $push: { connectTokens: accessToken }}, cb);
}

UserSchema.statics.insertStripeCustomerID = function(userID, customerID, cb) {
  User.update({'_id': userID}, { $set: { stripeCustomerID: customerID }}, cb);
}

UserSchema.statics.updateTimeStamp = function(userID, newDate, cb) {
  User.update({'_id': userID}, { $set: { lastRefresh: newDate }}, cb);
}

UserSchema.statics.fetchAllDonations = function(userID, cb) {
  User.findOne({'_id': userID}, 'donations', cb)
}

module.exports = mongoose.model('User', UserSchema);
