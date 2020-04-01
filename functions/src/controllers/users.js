const controllerHelper = require('../helpers');
const userModel = require('../models/users');

function createUser(_req, res) {
    userModel.createUser(controllerHelper.getAuthHeader(_req), _req.body.name, _req.body.pincode, _req.body.phone).then((user) => {
        return res.status(201)
                  .json({
                      success: true,
                      user:user
                    });
    }).catch((error) => {
        console.error(error);
        return res.status(400)
                  .json({
                      success: false,
                      message: error.message
                    });
    })
}

module.exports = {
    createUser
}