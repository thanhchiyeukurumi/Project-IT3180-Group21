const person = require('../models/person.js');
const household = require('../models/household.js');
const apartment = require('../models/apartment.js');
const mongoose = require('mongoose');


const createPerson = async (req, res) => {
  try {
    const reqPerson = req.body;
    const personFound = await person.findOne({ cic: reqPerson.cic });
    if(personFound)
      return res.status(402).json({ message: "CIC already exists", person: personFound._id });

    if(reqPerson.status !== 'Thường trú' && reqPerson.movingIn >= reqPerson.endTemporary)
      return res.status(402).json({ message: "Invalid date range" });
    if(reqPerson.dob > reqPerson.movingIn)
      return res.status(402).json({ message: "Invalid date range" });

    const newPerson = new person({
      ...reqPerson
    });
    await newPerson.save();
    res.status(200).json({ message: "Success", person: newPerson._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

const editPerson = async (req, res) => {
  try {
    const { id } = req.query;
    if (!mongoose.isValidObjectId(id))
      return res.status(402).json({ message: 'Invalid person' });

    const { householdId, numbers, floors, ...reqPerson } = req.body;
    let personFound = await person.findOne({ _id: id });

    if(!personFound)
      return res.status(402).json({ message: "Invalid person" });

    let checkPerson = await person.findOne({ cic: reqPerson.cic });
    if(checkPerson && checkPerson._id.toString() !== id)
      return res.status(402).json({ message: "CIC already exists" });

    if(reqPerson.status !== 'Thường trú' && reqPerson.movingIn >= reqPerson.endTemporary)
      return res.status(402).json({ message: "Invalid date range" });
    if(reqPerson.dob > reqPerson.movingIn)
      return res.status(402).json({ message: "Invalid date range" });

    Object.keys(reqPerson).forEach(key => {
      personFound[key] = reqPerson[key];
    });
    await personFound.save();

    if(numbers) {
      if (!mongoose.isValidObjectId(householdId))
        return res.status(402).json({ message: 'Invalid household' });
      let householdFound = await household.findOne({ _id: householdId });

      // WARNING: only 1 apartment case
      if(floors !== (numbers / 100).toFixed(0))
        return res.status(409).json({ message: "Apartment's not in the same floor" });
      console.log(householdFound.apartments[0]);
      let [apartmentFound, oldApartment] = await Promise.all([ apartment.findOne({ number: Number(numbers) }), apartment.findOne({ _id: householdFound.apartments[0] }) ]);
      if(!apartmentFound) {
        apartmentFound = new apartment({
          household: householdId,
          number: Number(numbers),
          type: "Căn hộ chung cư",
          totalArea: 85
        })
      } else {
        if(apartmentFound.household)
          return res.status(409).json({ message: "Apartment's in used" });
        apartmentFound.household = householdId;
      }
      
      householdFound.apartments[0] = apartmentFound._id;
      oldApartment.household = null;
      await Promise.all([householdFound.save(), oldApartment.save(), apartmentFound.save()]);
    }
    res.status(200).json({ message: "Success", person: personFound._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletePerson = async (req, res) => {
  try {
    const { id } = req.query;
    if (!mongoose.isValidObjectId(id))
      res.status(400).json({ message: 'Invalid person' });

    const personFound = await person.findOne({ _id: id });
    if(!personFound) 
      res.status(400).json({ message: 'Invalid person' });

    await person.deleteOne({ _id: id });
    res.status(200).json({ message: "Delete complete" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getPersonDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!mongoose.isValidObjectId(id))
      res.status(400).json({ message: 'Invalid person' });

    const personFound = await person.findOne({_id: id.toString(),});
    if(!personFound)  
      res.status(400).json({ message: 'Invalid person' });

    res.status(200).json({ message: "Success", person: personFound });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getFilterdList = async (req, res) => {
    try {
      const { name, gender, status } = req.body;
      let listFiltered = await person.find();
      if(name !== null)  listFiltered = listFiltered.filter((personFound) => personFound.name === name);
      if(gender !== null)  listFiltered = listFiltered.filter((personFound) => personFound.gender === gender);
      if(status !== null) listFiltered = listFiltered.filter((personFound) => personFound.status === status);
      res.status(200).json(listFiltered);
    } catch (error) {
      res.status(500).json(error);
    }
  };

const getPersonAll = async (req, res) => {
  try {
    // Pagination
    let pagination = {
      currentPage: 1,
      limitItem: 8, 
    };

    if (req.query.page) {
      pagination.currentPage = parseInt(req.query.page);
    }

    const skip = (pagination.currentPage - 1) * pagination.limitItem;
    pagination.totalItems = await person.countDocuments();
    pagination.totalPage = Math.ceil(pagination.totalItems / pagination.limitItem);
    
    let personFound = await person.find({}).skip(skip).limit(pagination.limitItem);
    let json = { ...pagination, array: [] };
    
    for(const data of personFound) {
      const householdFound = await household.findOne({ _id: data.householdId });
      const ownedApartments = await Promise.all(householdFound.apartments.map(ID => apartment.findOne({ _id: ID })));
      const numbers = ownedApartments.map(owned => owned.number);
      const floors = ownedApartments.map(owned => (Number(owned.number) / 100).toFixed(0));

      json.array.push({
        ...data._doc,
        floors: floors,
        numbers: numbers,
      });
    }
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json(error);
  }
} 


module.exports = {
  createPerson,
  editPerson,
  deletePerson,
  getPersonDetail,
  getPersonAll,
  getFilterdList
};
