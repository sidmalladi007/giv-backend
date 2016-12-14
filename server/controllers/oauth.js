'use strict'
var env = require('node-env-file');
env(__dirname + '/../.env');
var plaid = require('plaid');
var stripe = require("stripe")(process.env.STRIPE_KEY);

const User = require('../models/user');

var PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
var PLAID_SECRET = process.env.PLAID_SECRET;

var plaidClient =
  new plaid.Client(PLAID_CLIENT_ID, PLAID_SECRET, plaid.environments.tartan);

exports.doPlaidAuthCallback = function(req, res, next) {
  var public_token = req.query.public_token;
  var account_id = req.query.account_id;
  plaidClient.exchangeToken(public_token, function(err, tokenResponse) {
    if (err != null) {
      res.json({error: 'Unable to exchange public_token'});
    } else {
      // The exchange was successful - this access_token can now be used to
      // safely pull account and routing numbers or transaction data for the
      // user from the Plaid API using your private client_id and secret.
      var plaidAccessToken = tokenResponse.access_token;
      var stripeBankToken = tokenResponse.stripe_bank_account_token;
      User.update({'_id': req.user._id}, { $push: { authTokens: plaidAccessToken } }, function(err, docsAffected) {
        if (err != null) {
          console.log(err);
        } else {
          stripe.customers.create({
            description: `Stripe customer account for ${req.user.firstName} ${req.user.lastName}`,
            source: stripeBankToken // obtained with Stripe.js
          }, function(err, customer) {
            if (err != null) {
              console.log(err);
            } else {
              User.update({'_id': req.user._id}, { $set: { stripeCustomerID: customer.id }}, function(err, docsAffected) {
                if (err != null) {
                  console.log(err);
                } else {
                }
                res.status(200).json({
                  result: "Success!"
                });
              })
            }
        });
      }
      });
    }
  })
}

exports.doPlaidConnectCallback = function(req, res, next) {
  var public_token = req.query.public_token;
  plaidClient.exchangeToken(public_token, function(err, tokenResponse) {
    if (err != null) {
      res.json({error: 'Unable to exchange public_token'});
    } else {
      // The exchange was successful - this access_token can now be used to
      // safely pull account and routing numbers or transaction data for the
      // user from the Plaid API using your private client_id and secret.
      var plaidAccessToken = tokenResponse.access_token;
      User.update({'_id': req.user._id}, { $push: { connectTokens: plaidAccessToken }}, function(err, docsAffected) {
        if (err != null) {
          console.log(err);
        } else {
          res.status(200).json({
            result: "Success!"
          });
        }
      });
    }
  })
}
