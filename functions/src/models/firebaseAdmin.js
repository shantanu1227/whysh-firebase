const admin = require('firebase-admin');
admin.initializeApp();
// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
module.exports = admin;