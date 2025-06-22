const apartment = require("../models/apartment.js");
const searchHelper = require("../helpers/search.js");

//[GET] apartments/api/v1/apartment
module.exports.index = async (req,res) => {
    try {
        const find = {};
        if (req.query.id){
            find.id = req.query.id;
        }
        //Search
        let objectSearch = searchHelper(req.query);
        if (req.query.keyword) {
            find.number = objectSearch.regex;
        }
        //End Search
        const apartments = await apartment.find(find);
        if (!apartments){
            return res.status(404).json({message: "Not Found"});
        } else {
            res.json(apartments);
        }
    } catch (error) {
        res.status(500).json({ message:"Server Error" });
    }
};

module.exports.getRemain = async (req, res) => {
    try {
        const apartments = await apartment.find({});
        const json = apartments.map(apt => {
            return {
                household_id: apt.household,
                floor: (apt.number / 100).toFixed(0),
                number: apt.number
            }
        });
        
        res.status(200).json(json);
    } catch (error) {
        res.status(500).json({ message:"Server Error" });
    }
}