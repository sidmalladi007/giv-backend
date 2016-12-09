'use strict'

var plaid = require('plaid');
var stripe = require("stripe")("sk_test_syV9DDTuDwIsdDGvxqVCA4K2");


const User = require('../models/user');
var PLAID_CLIENT_ID = "5833c41ba753b969cf26fc61" //envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = "a638a5459aeb83bb674ffb30492035"
var plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_SECRET, plaid.environments.tartan);

exports.showUserInfo = function(req, res, next) {
  // let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: req.user
  });
  return next();
}

function sortTransactions(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
}

exports.fetchTransactions = function(req, res, next) {
  User.plaidPullContext(req.user._id, function(err, context) {
    var now = new Date();
    if (err) { console.log(err); }
    var refreshTime;
    if (context.lastRefresh == null) {
      refreshTime = '30 days ago';
      plaidClient.getConnectUser(context.connectTokens[0], { gte: refreshTime, }, function(err, response) {
        var newSpareChange = 0;
        var allTransactionsToAdd = [];
        response.transactions.forEach(function(transaction) {
          var name = transaction.name;
          var amount = transaction.amount;
          var date = transaction.date;
          var change = Math.floor(transaction.amount+1) - transaction.amount;
          newSpareChange += change;
          var newTransaction = {name: name, amount: amount, change: change, date: date};
          allTransactionsToAdd.push(newTransaction);
        });
        User.addTransactions(req.user._id, allTransactionsToAdd, function(err, results) {
          if (err) {
            console.log(err);
          } else {
            let rightNow = new Date();
            User.updateTimeStamp(req.user._id, rightNow, function(err, results) {
              if (err) {console.log(err);}
            })
          }
          User.updateSpareChange(req.user._id, newSpareChange, function(err, results) {
            if (err) { console.log(err); }
            var displayedSpareChange;
            User.retrieveSpareChange(req.user._id, function(err, results) {
              if (err) { console.log(err); }
              displayedSpareChange = results.spareChange;
              User.retrieveSavedTransactions(req.user._id, function(err, documents) {
                var sortedDocs = sortTransactions(documents, date);
                res.status(200).json({
                  transactions: sortedDocs,
                  spareChange: displayedSpareChange
                });
              });
            })
          })
        })
      });
    } else if (now - context.lastRefresh > 86400000) {
      refreshTime = new Date(context.lastRefresh.getTime() + 60000*1440);
      plaidClient.getConnectUser(context.connectTokens[0], { gte: refreshTime, }, function(err, response) {
        var newSpareChange = 0;
        var allTransactionsToAdd = [];
        response.transactions.forEach(function(transaction) {
          var name = transaction.name;
          var amount = transaction.amount;
          var date = transaction.date;
          var change = Math.floor(transaction.amount+1) - transaction.amount;
          newSpareChange += change;
          var newTransaction = {name: name, amount: amount, change: change, date: date};
          allTransactionsToAdd.push(newTransaction);
        });
        User.addTransactions(req.user._id, allTransactionsToAdd, function(err, results) {
          if (err) {
            console.log(err);
          } else {
            let rightNow = new Date();
            User.updateTimeStamp(req.user._id, rightNow, function(err, results) {
              if (err) {console.log(err);}
            })
          }
          User.updateSpareChange(req.user._id, newSpareChange, function(err, results) {
            if (err) { console.log(err); }
            var displayedSpareChange;
            User.retrieveSpareChange(req.user._id, function(err, results) {
              if (err) { console.log(err); }
              displayedSpareChange = results.spareChange;
              User.retrieveSavedTransactions(req.user._id, function(err, documents) {
                var sortedDocs = sortTransactions(documents, date);
                res.status(200).json({
                  transactions: sortedDocs,
                  spareChange: displayedSpareChange
                });
              });
            })
          })
        })
      });
    } else {
      User.retrieveSpareChange(req.user._id, function(err, results) {
        if (err) { console.log(err); }
        displayedSpareChange = results.spareChange;
        User.retrieveSavedTransactions(req.user._id, function(err, documents) {
          var sortedDocs = sortTransactions(documents, date);
          res.status(200).json({
            transactions: sortedDocs,
            spareChange: displayedSpareChange
          });
        });
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

exports.fetchDonations = function(req, res, next) {
  User.fetchAllDonations(req.user._id, function(err, allDonations) {
    if (err) { console.log(err); }
    res.status(200).json({
      donations: allDonations
    });
  })
}

exports.makeDonation = function(req, res, next) {

  User.createDonation
  res.status(200).json({
    result: "Okay"
  });
  return next();
}
