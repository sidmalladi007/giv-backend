const AuthenticationController = require('./controllers/authentication');
const express = require('express');
const passportService = require('./config/passport');
const passport = require('passport');
const APIController = require('./controllers/api');
const oauthController = require('./controllers/oauth');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

const REQUIRE_DONOR = "Donor";
const REQUIRE_CHARITY = "Charity";

module.exports = function(app) {
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const oauthRoutes = express.Router();

  //=========================
  // Organize API resources
  //=========================

  apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/oauth', oauthRoutes);

  // Handle app authentication
  authRoutes.post('/register', AuthenticationController.register);
  authRoutes.post('/login', requireLogin, AuthenticationController.login);

  // Handle oauth callbacks
  oauthRoutes.post('/plaidauthcallback', requireAuth, oauthController.doPlaidAuthCallback);
  oauthRoutes.post('/plaidconnectcallback', requireAuth, oauthController.doPlaidConnectCallback);

  // API functionality
  apiRoutes.get('/fetchtransactions', requireAuth, APIController.fetchTransactions);

  apiRoutes.get('/fetchdonations', requireAuth, APIController.fetchDonations);

  apiRoutes.post('/makedonation', requireAuth, APIController.makeDonation);

  apiRoutes.get('/listcharities', requireAuth, APIController.listAllCharities);

  apiRoutes.post('/connectcharity', requireAuth, APIController.connectCharity);

  apiRoutes.get('/showuserinfo', requireAuth, APIController.showUserInfo);

  apiRoutes.get('/showsparechange', requireAuth, APIController.showChange);


// Set url for API group routes
  app.use('/api', apiRoutes);
};
