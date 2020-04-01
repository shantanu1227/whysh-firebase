const firestore = require('./firestore').firestore;
const modelHelper = require('./helper');

const categories = [
    {
        hO5jiAKjjSAvoxXzG9Ko: {
            createdAt: new Date(),
            name: "water"
        },
        JHlOXWpiO0D0HnrgKYvJ: {
            createdAt: new Date(),
            name: "medicines"
        },
        mmk7Jx01pdslMBX87h7E: {
            createdAt: new Date(),
            name: "grocery"
        }
    }
]

const users = [
    {
        "05TFdLZ9HxgnOzRmpMeuxWjcNpV2": {
            name: "Shantanu",
            phone: "7406260857",
            pincode: 560076,
            id: "05TFdLZ9HxgnOzRmpMeuxWjcNpV2",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }
]

async function _seed(collection, data) {
    let batch = firestore.batch();
    data.forEach(_datum => {
        for(key in _datum) {
            let _data = firestore.collection(collection).doc(key);
            batch.set(_data, _datum[key]);
        }
    });
    try {
        await batch.commit();
        console.info(`${collection} Seeded Successfully`);
    }
    catch (error) {
        console.error(`Error seeding ${collection}`, categories);
    }
}

function seedCategories() {
    _seed(modelHelper.CATEGORY_COLLECTION, categories);
}

function seedUsers() {
    _seed(modelHelper.USER_COLLECTION, users);
}

function seed() {
    seedCategories();
    seedUsers();
}

module.exports = {
    seed
}