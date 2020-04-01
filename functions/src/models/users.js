const admin = require('./firebaseAdmin');
const firestore = require('./firestore').firestore
const modelHelper = require('./helper');

function authenticateUser(userIdToken) {
    return admin.auth().verifyIdToken(userIdToken);
}

function getUser(userIdToken) {
    return authenticateUser(userIdToken).then((decodedToken) => {
        return firestore.collection(modelHelper.USER_COLLECTION).doc(decodedToken.uid).get();
    }).catch((error) => {
        return Promise.reject(error);
    })
}

function createUser(userIdToken, name, pincode, phone) {
    return admin.auth().verifyIdToken(userIdToken).then((decodedToken) => {
        return firestore.collection(modelHelper.USER_COLLECTION).doc(decodedToken.uid).get()
        .then((document) => {
            let data = {
                name: name,
                pincode: parseInt(pincode),
                updatedAt: new Date(),
                loginCount: 1
            }
            if (!document.exists) {
                data.id = decodedToken.uid;
                data.phone = phone;
                data.createdAt = new Date();
            } else {
                data.loginCount = document.get('loginCount')?document.get('loginCount')+1:1
            }
            let response = Object.assign({}, data);
            response.id = decodedToken.uid
            response.phone = phone;
            return firestore.collection(modelHelper.USER_COLLECTION).doc(decodedToken.uid).set(data, {merge: true}).then(() => {
                return Promise.resolve(response);
            });
        })
    });
}

module.exports = {
    getUser,
    createUser,
    authenticateUser
}