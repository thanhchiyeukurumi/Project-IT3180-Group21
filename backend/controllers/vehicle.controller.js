const Vehicle = require("../models/vehicle.js");
const Household = require("../models/household.js");
const Person = require("../models/person.js");

//[GET] vehicles/api/v2/vehicles
module.exports.index = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[POST] vehicles/api/v2/delete
module.exports.deleteVehicle = async (req, res) => {
  try {
    const { household_id, plate, vehicle_type } = req.body;
    await Vehicle.updateOne(
      {  household_id },
      {
        $pull: { vehicle: { plate, vehicle_type } },
      }
    );
    let updateData = {};

    if (vehicle_type === "Xe máy") {
      updateData = {
        $pull: { motobikes: { plate, vehicle_type } },
      };
    } else if (vehicle_type === "Ô tô") {
      updateData = {
        $pull: { cars: { plate, vehicle_type } },
      };
    }

    await Household.updateOne({ _id: household_id }, updateData);
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting vehicle" });
  }
};

//[POST] vehicles/api/v2/create
module.exports.createVehicle = async (req, res) => {
  try {
    const { ownName, vehicle_type, plate } = req.body;    
    let personFound = await Person.findOne({
      name: ownName
    });
    let householdFound = await Household.findOne({
      head: personFound._id
    });
    let vehicleRecord = await Vehicle.findOne({
      household_id: householdFound._id
    });

    if (!vehicleRecord) {
      vehicleRecord = new Vehicle({
        ownName,
        household_id: householdFound._id,
        vehicle: [{ plate, vehicle_type }],
      });
    } else {
      const vehicleRc = await Vehicle.findOne({ "vehicle.plate": plate });
      if (!vehicleRc) {
        vehicleRecord.vehicle.push({ plate, vehicle_type });
      }
    }
    await vehicleRecord.save();

    const updateField = vehicle_type === "Xe máy" ? "motobikes" : "cars";
    await Household.updateOne(
      { _id: householdFound._id },
      { $addToSet: { [updateField]: { vehicle_type, plate } } }
    );
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
