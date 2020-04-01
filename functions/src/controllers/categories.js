const categoryModel = require('../models/categories');

function getCategories(_req, res) {
    categoryModel.listAll().then((snapshot) => {        
        categories = [];
        snapshot.docs.forEach(doc => {
            let data = doc.data();
            categories.push({id: doc.id, name: data.name, createdAt: data.createdAt.toDate()});
        })
        return res.json({
            success: true,
            categories: categories,
        });
    }).catch((error) => {
        console.error('Error Fetching categories', error);
    });
}

module.exports = {
    getCategories
}