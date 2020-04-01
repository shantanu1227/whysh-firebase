const functions = require('firebase-functions');
const server = require('./src/server')
const seeder = require('./src/seeder');
const api = functions
            .runWith({memory: "1GB", timeoutSeconds: "120"})
            .region('asia-east2')
            .https
            .onRequest(server);
const seed = functions
            .region('asia-east2')
            .https
            .onRequest(seeder);
module.exports = {
    api,
    seed
}
