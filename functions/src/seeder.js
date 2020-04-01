const dataSeeder = require('./models/dataSeeder');
const seeder = function(_req, res) {
    try{
        dataSeeder.seed();
        return res.json({
            success: true
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = seeder;