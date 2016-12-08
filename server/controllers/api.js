'use strict'

var plaid = require('plaid');

const User = require('../models/user');
var PLAID_CLIENT_ID = "5833c41ba753b969cf26fc61" //envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = "a638a5459aeb83bb674ffb30492035"
var plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_SECRET, plaid.environments.tartan);

exports.fetchDonations = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: "Okay"
  });
  return next();
}

exports.showUserInfo = function(req, res, next) {
  // let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: req.user
  });
  return next();
}

exports.fetchTransactions = function(req, res, next) {
  User.plaidPullContext(req.user._id, function(err, context) {
    var now = new Date();
    if (err) { console.log(err); }
    var refreshTime;
    if (context.lastRefresh === null) {
      refreshTime = '30 days ago';
      plaidClient.getConnectUser(context.plaid.connectTokens[0], { gte: refreshTime, }, function(err, response) {
        var transactions = [];
        response.transactions.forEach(function(transaction) {
          var name = transaction.name;
          var amount = transaction.amount;
          var date = transaction.date;
          var change = Math.floor(transaction.amount+1);
          var transaction = {name: name, amount: amount, change: change, date: date};
          User.addTransaction(req.user._id, transaction, function(err, transaction) {
            if (err) {
              console.log(err);
            }
          });
        });
        let today = new Date();
        let fromDate = new Date(today.getTime() - 60000*43200);
        User.retrieveSavedTransactions(req.user._id, function(err, documents) {
          res.status(200).json({
            transactions: documents
          })
        });
      });
    } else if (now - context.lastRefresh > 86400000) {
      refreshTime = new Date(context.lastRefresh.getTime() + 60000*1440);
      plaidClient.getConnectUser(context.plaid.connectTokens[0], { gte: refreshTime, }, function(err, response) {
        var transactions = [];
        response.transactions.forEach(function(transaction) {
          var name = transaction.name;
          var amount = transaction.amount;
          var date = transaction.date;
          var change = Math.floor(transaction.amount+1);
          var transaction = {name: name, amount: amount, change: change, date: date};
          User.addTransaction(req.user._id, transaction, function(err, transaction) {
            if (err) {
              console.log(err);
            }
          });
        });
        let today = new Date();
        let fromDate = new Date(today.getTime() - 60000*43200);
        User.retrieveSavedTransactions(req.user._id, function(err, documents) {
          res.status(200).json({
            transactions: documents
          });
        });
      });
    } else {
      let today = new Date();
      let fromDate = new Date(today.getTime() - 60000*43200);
      User.retrieveSavedTransactions(req.user._id, function(err, documents) {
        res.status(200).json({
          transactions: documents
        })
      })
    }
  }
)}

exports.connectCharity = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: "Okay"
  });
  return next();
}

exports.makeDonation = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: "Okay"
  });
  return next();
}
