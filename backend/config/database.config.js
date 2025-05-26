const mongoose = require("mongoose");
//Connect database
module.exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {dbName: "it3180"});
        console.log("Connect Database: Success!");
    } catch (error){
        console.log("Connect Database: Error!");
    }
}