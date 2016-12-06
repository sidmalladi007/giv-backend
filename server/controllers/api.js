'use strict'

const User = require('../models/user');

exports.fetchTransactions = function(req, res, next) {
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

exports.fetchDonations = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  res.status(200).json({
    result: "Okay"
  });
  return next();
}

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
