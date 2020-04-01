function getAuthHeader(_req) {
    return _req.get('authorization');
}

module.exports = {
    getAuthHeader
}