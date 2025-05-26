const person = require('../models/person.js');
const apartment = require('../models/apartment.js');

const getDashboardOverview = async (req, res) => {
    try {
      const recentCustomers = await person.find().sort({ movingIn: -1 });
      const numApartment = await apartment.countDocuments();
      const numPerson = await person.countDocuments();
      const numAbsence = await person.countDocuments({ status: "Tạm vắng" });
      const numTemporary = await person.countDocuments({ status: "Tạm trú" });
      
      let json = {
        recentCustomers: recentCustomers.slice(0, 10),
        numApartment: numApartment,
        numPerson: numPerson,
        numTemporary: numTemporary,
        numAbsence: numAbsence
      }
      res.status(200).json(json);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  module.exports = {
    getDashboardOverview
  }