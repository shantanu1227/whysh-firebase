const firestore = require('./firestore').firestore;
const modelHelper = require('./helper');

function listAll() {
    const field = 'name'
    let query = firestore.collection(modelHelper.CATEGORY_COLLECTION).orderBy(field);
    return query.get();
}

module.exports = {
    listAll
}