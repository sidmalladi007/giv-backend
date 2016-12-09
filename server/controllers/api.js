'use strict'

var plaid = require('plaid');
var stripe = require("stripe")("sk_test_syV9DDTuDwIsdDGvxqVCA4K2");


const User = require('../models/user');
var PLAID_CLIENT_ID = "584a46a139361950fd107cdd" //envvar.string('PLAID_CLIENT_ID');
var PLAID_SECRET = "9dc438ec35793f5395f3011f006aed"
var plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_SECRET, plaid.environments.tartan);

exports.showUserInfo = function(req, res, next) {
  // let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: req.user
  });
  return next();
}

exports.listAllCharities = function(req, res, next) {
  res.status(200).json({
    charities: ["Red Cross", "UNICEF", "Sierra Club", "Bharatiyam"]
  });
  return next();
}

function sortTransactions(array, key) {
    return array.transactions.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
}

exports.fetchTransactions = function(req, res, next) {
  User.findOne({'_id': req.user._id}, 'connectTokens lastRefresh', function(err, context) {
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
          if (name.startsWith("DEBIT CARD PURCHASE")) {
            name = name.split(' ').slice(4).join(' ');
          }
          var amount = transaction.amount
          var displayedAmount = amount.toFixed(2);
          var change = Math.floor(transaction.amount+1) - transaction.amount
          var displayedChange = change.toFixed(2);
          newSpareChange += change;
          var newTransaction = {name: name, amount: displayedAmount, change: displayedChange};
          allTransactionsToAdd.push(newTransaction);
        });
        User.update({'_id': req.user._id}, { $push: { transactions: { $each: allTransactionsToAdd } } }, function(err, results) {
          if (err) {
            console.log(err);
          } else {
            let rightNow = new Date();
            User.update({'_id': req.user._id}, { $set: { lastRefresh: rightNow }}, function(err, results) {
              if (err) {console.log(err);}
            })
          }
          User.findOne({'_id': req.user._id}, 'spareChange', function(err, result) {
            if (err) { console.log(err); }
            var updatedSpareChangeValue = result.spareChange + newSpareChange;
            User.update({'_id': req.user._id}, { $set: { spareChange: updatedSpareChangeValue }}, function(err, results) {
              if (err) { console.log(err); }
              var displayedSpareChange;
              User.findOne({'_id': req.user._id}, 'spareChange', function(err, results) {
                if (err) { console.log(err); }
                displayedSpareChange = results.spareChange;
                User.findOne({'_id': req.user._id}, 'transactions', function(err, documents) {
                  var sortedDocs = sortTransactions(documents, 'date');
                  res.status(200).json({
                    transactions: sortedDocs,
                    spareChange: displayedSpareChange
                  });
                });
              })
            });
          });
        })
      });
    } else if (now - context.lastRefresh > 86400000) {
      refreshTime = new Date(context.lastRefresh.getTime() + 60000*1440);
      plaidClient.getConnectUser(context.connectTokens[0], { gte: refreshTime, }, function(err, response) {
        var newSpareChange = 0;
        var allTransactionsToAdd = [];
        response.transactions.forEach(function(transaction) {
          var name = transaction.name;
          if (name.startsWith("DEBIT CARD PURCHASE")) {
            name = name.split(' ').slice(4).join(' ');
          }
          var amount = transaction.amount
          var displayedAmount = amount.toFixed(2);
          var change = Math.floor(transaction.amount+1) - transaction.amount
          var displayedChange = change.toFixed(2);
          newSpareChange += change;
          var newTransaction = {name: name, amount: displayedAmount, change: displayedChange};
          allTransactionsToAdd.push(newTransaction);
        });
        User.update({'_id': req.user._id}, { $push: { transactions: { $each: allTransactionsToAdd } } }, function(err, results) {
          if (err) {
            console.log(err);
          } else {
            let rightNow = new Date();
            User.update({'_id': req.user._id}, { $set: { lastRefresh: rightNow }}, function(err, results) {
              if (err) {console.log(err);}
            })
          }
          User.findOne({'_id': req.user._id}, 'spareChange', function(err, result) {
            if (err) { console.log(err); }
            var updatedSpareChangeValue = result.spareChange + newSpareChange;
            User.update({'_id': req.user._id}, { $set: { spareChange: updatedSpareChangeValue }}, function(err, results) {
              if (err) { console.log(err); }
              var displayedSpareChange;
              User.findOne({'_id': req.user._id}, 'spareChange', function(err, results) {
                if (err) { console.log(err); }
                displayedSpareChange = results.spareChange;
                User.findOne({'_id': req.user._id}, 'transactions', function(err, documents) {
                  var sortedDocs = sortTransactions(documents, 'date');
                  res.status(200).json({
                    transactions: sortedDocs,
                    spareChange: displayedSpareChange
                  });
                });
              })
            });
          });
        });
      })
    } else {
      User.findOne({'_id': req.user._id}, 'spareChange', function(err, results) {
        if (err) { console.log(err); }
        var displayedSpareChange = results.spareChange;
        User.findOne({'_id': req.user._id}, 'transactions', function(err, documents) {
          var sortedDocs = sortTransactions(documents, 'date');
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
  let connectedCharities = req.body.charities
  User.update({'_id': req.user._id}, { $set: { charities: connectedCharities } }, function(err, results) {
    res.status(200).json({
      result: "Success!"
    })
  })
}

exports.fetchDonations = function(req, res, next) {
  User.findOne({'_id': req.user._id}, 'donations', function(err, allDonations) {
    if (err) { console.log(err); }
    res.status(200).json({
      donations: allDonations.donations
    });
  })
}

exports.showChange = function(req, res, next) {
  User.findOne({'_id': req.user._id}, 'spareChange', function(err, result) {
    if (err) { console.log(err); }
    res.status(200).json({
      spareChange: result.spareChange
    })
  })
}

exports.makeDonation = function(req, res, next) {
  User.findOne({'_id': req.user._id}, 'spareChange', function(err, result) {
    var change = result.spareChange;
    User.update({'_id': req.user._id}, { $set: { spareChange: 0 }}, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({
          result: "Success!"
        });
      }
    })
    // User.findOne({'_id': req.user._id}, 'stripeCustomerID', function(err, stripeInfo) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     var customerID = stripeInfo.stripeCustomerID;
    //     stripe.charges.create({
    //       amount: change,
    //       currency: "usd",
    //       customer: customerID,
    //       description: "Giv donation"
    //     }, function(err, charge) {
    //         if (err) {
    //           console.log(err);
    //         } else {
    //           User.update({'_id': req.user._id}, { $set: { spareChange: 0 }}, function(err, result) {
    //             if (err) {
    //               console.log(err);
    //             } else {
    //               res.status(200).json({
    //                 result: "Success!"
    //               });
    //             }
    //           })
    //         }
    //       });
    //     }
    //   })
    })
}
