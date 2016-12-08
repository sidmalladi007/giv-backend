'use strict'

var plaid = require('plaid');
var stripe = require("stripe")("sk_test_syV9DDTuDwIsdDGvxqVCA4K2");

const User = require('../models/user');

var PLAID_CLIENT_ID = "5833c41ba753b969cf26fc61" //envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = "a638a5459aeb83bb674ffb30492035" //envvar.string('PLAID_SECRET');

var plaidClient =
  new plaid.Client(PLAID_CLIENT_ID, PLAID_SECRET, plaid.environments.tartan);

exports.doPlaidAuthCallback = function(req, res, next) {
  var public_token = req.query.public_token;
  var account_id = req.query.account_id;
  plaidClient.exchangeToken(public_token, function(err, tokenResponse) {
    if (err != null) {
      res.json({error: 'Unable to exchange public_token'});
      console.log("Token exchange didn't work");
    } else {
      // The exchange was successful - this access_token can now be used to
      // safely pull account and routing numbers or transaction data for the
      // user from the Plaid API using your private client_id and secret.
      var plaidAccessToken = tokenResponse.access_token;
      var stripeBankToken = tokenResponse.stripe_bank_account_token;
      User.static.insertPlaidAuthToken(req.user._id, plaidAccessToken, function(err, docsAffected) {
        if (err != null) {
          console.log(err);
        } else {
          console.log("Plaid token inserted!");
        }
      });
      stripe.customers.create({
        description: `Stripe customer account for ${req.user.firstName} ${req.user.lastName}`,
        source: stripeBankToken // obtained with Stripe.js
      }, function(err, customer) {
        if (err != null) {
          console.log(err);
        } else {
          console.log("Stripe customer created!");
          User.static.insertStripeCustomerID(req.user._id, customer.id, function(err, docsAffected) {
            if (err != null) {
              console.log(err);
            } else {
              console.log("Stripe ID inserted!");
            }
          })
        }
      });
    }
  })
}

exports.doPlaidConnectCallback = function(req, res, next) {
  var public_token = req.query.public_token;
  var account_id = req.query.account_id;
  plaidClient.exchangeToken(public_token, function(err, tokenResponse) {
    if (err != null) {
      res.json({error: 'Unable to exchange public_token'});
      console.log("Token exchange didn't work");
    } else {
      // The exchange was successful - this access_token can now be used to
      // safely pull account and routing numbers or transaction data for the
      // user from the Plaid API using your private client_id and secret.
      var plaidAccessToken = tokenResponse.access_token;
      User.static.insertPlaidConnectToken(req.user._id, plaidAccessToken, function(err, docsAffected) {
        if (err != null) {
          console.log(err);
        } else {
          console.log("Plaid token inserted!");
        }
      });
    }
  })
}
