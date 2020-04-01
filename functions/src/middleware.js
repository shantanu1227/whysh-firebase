const userModel = require('./models/users');
const helper = require('./helpers');

const authHeaderCheck = function(_req, res, next) {
    const authHeader = helper.getAuthHeader(_req);
    if (authHeader && authHeader !== null ) {
        return next();
    } else {
        return res.status(401)
                  .json({success: false, data: "Unauthorized"});
    }
}

const authenticateUser = function(_req, res, next) {
    const authHeader = helper.getAuthHeader(_req);
    userModel.authenticateUser(authHeader).then(()=> {
        return next();
    })
    .catch((error) => {
        console.error("authenticatUser", error);
        return res.status(401)
                .json({success: false, data: "Unauthorized"});
    });
}

const setUser = function(_req, res, next) {
    const authHeader = helper.getAuthHeader(_req);
    userModel.getUser(authHeader).then((user)=> {
        if (user.exists) {
            _req.user = user.data();
            return next();
        } else {
            return res.status(401)
                .json({success: false, data: "Unauthorized"});
        }
    })
    .catch((error) => {
        console.error("setUser", error);
        return res.status(401)
                .json({success: false, data: "Unauthorized"});
    });
}

module.exports = {
    authHeaderCheck,
    authenticateUser,
    setUser
}