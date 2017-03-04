module.exports = {
  // App Settings
  MONGO_URI: process.env.MONGO_URI || 'localhost',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'YOUR_UNIQUE_JWT_TOKEN_SECRET',

  // OAuth 2.0
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || 'aacc28b3486c53189421a6e2bc572e71',
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || 'MDNmF4gWKk1R7bm04Z8drR-N',
  
};