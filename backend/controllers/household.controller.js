const mongoose = require('mongoose');
const person = require('../models/person.js');
const household = require('../models/household.js');
const apartment = require('../models/apartment.js');
const payment = require('../models/payment.js');
const vehicle = require('../models/vehicle.js');

const getHouseholds = async (req, res) => {
  try {
    const { id } = req.query;
    const conditions = id ? { _id: id } : {};
    // Pagination
    let pagination = {
      currentPage: 1,
      limitItem: 8,
    };

    if (req.query.page) {
      pagination.currentPage = parseInt(req.query.page);
    }
    const skip = (pagination.currentPage - 1) * pagination.limitItem;
    pagination.totalItems = await household.countDocuments(conditions);
    pagination.totalPage = Math.ceil(pagination.totalItems / pagination.limitItem);
    //End Pagination

    let householdsFound = await household.find(conditions).skip(skip).limit(pagination.limitItem);
    let json = { ...pagination, array: [] };

    for(const data of householdsFound) {
      const head = await person.findOne({ _id: data.head });
      
      const ownedApartments = await Promise.all(data.apartments.map(ID => apartment.findOne({ _id: ID })));
      const numbers = ownedApartments.map(owned => owned.number);
      const floors = ownedApartments.map(owned => (Number(owned.number) / 100).toFixed(0));

      json.array.push({ 
        id: data._id, 
        head: head.name, 
        contact: data.contact_phone, 
        status: head.status, 
        floors: floors, 
        numbers: numbers
      });
    }
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json(error);
  }
};

const createHousehold = async (req, res) => {
  try {
    const { number, id, contact_phone, ...householdInfo } = req.body;
    let apartmentFound = await apartment.findOne({ number: number });
    if(apartmentFound && apartmentFound.household)
      res.status(402).json({ message: "In used" });
    else {
      if(!apartmentFound) {
        apartmentFound = new apartment({
          household: null,
          number: Number(number),
          type: "Căn hộ chung cư",
          totalArea: 85
        })
      }
      
      const newHousehold = new household({
        head: id,
        apartments: [apartmentFound._id],
        contact_phone,
        members: []
      });
      await newHousehold.save();

      apartmentFound.household = newHousehold._id;
      await apartmentFound.save();

      await person.findByIdAndUpdate(id, { householdId: newHousehold._id });

      const totalItems = await household.countDocuments();
      const lastPage = Math.ceil(totalItems / 8); // limitItem = 8;
      res.status(200).json({ message: "Success", household: newHousehold._id, lastPage});
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const editHousehold = async (req, res) => {
  try {
    const { id, apartmentNumber, headId, relationship }  = req.body;
    const householdFound = await household.findOne({ _id: id });

    if (householdFound.apartment_number !== apartmentNumber) {
      householdFound.apartment_number = apartmentNumber;
    }

    if (householdFound.head !== headId) {
      if (householdFound.head) {
        const oldHead = await person.findOne({ _id: householdFound.head });
        const newHead = await person.findOne({ _id: headId });

        oldHead.relation_to_owner = relationship;
        newHead.relation_to_owner = "Owner";
        await oldHead.save();
        await newHead.save();

        householdFound.members = householdFound.members.filter((personId) => personId !== newHead._id);
        if(relationship !== null) householdFound.members.push(oldHead._id);
        householdFound.head = headId;
      } else {
        const newHead = await person.findOne({ _id: headId });
        newHead.relation_to_owner = "Owner";
        await newHead.save();

        householdFound.members = householdFound.members.filter((personId) => personId !== newHead._id);
        householdFound.head = headId;
      }
    }
    await householdFound.save();
    res.status(200).json({ message: "Success", household: householdFound._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteHousehold = async (req, res) => {
  try {
    const id = req.body.householdID;
    if (!mongoose.isValidObjectId(id))
      res.status(400).json('Invalid household');
    // console.log(id);
    const householdFound = await household.findOne({ _id: id });
    if(!householdFound) res.status(400).json('Invalid household');
    
    if (householdFound.head) {
      await person.deleteOne({ _id: householdFound.head });
    }
    for(const memberId of householdFound.members) {
      await person.deleteOne({ _id: memberId });
    };

    for (const id of householdFound.apartments) {
      await apartment.findByIdAndUpdate(id, { household: null });
    }

    await payment.deleteMany({ household_id: id });
    await vehicle.deleteOne({ household_id: id });
    await household.deleteOne({ _id: id });
    res.status(200).json({ message: "Delete complete" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getHouseholdDetail = async (req, res) => {
  try {
    const { householdId } = req.query;
    if (!mongoose.isValidObjectId(householdId))
      return res.status(400).json({ message: 'Invalid household' });
    
    const householdFound = await household.findOne({ _id: householdId });

    if(!householdFound)  
      return res.status(400).json({ message: 'Invalid household' });
    let json = householdFound._doc;
    let mem = [];
    [json.head, mem, json.apartments] = await Promise.all([
      person.findOne({ _id: householdFound.head }),
      Promise.all(householdFound.members.map(member => person.findOne({ _id: member.member_id }))),

      // WARNING: only 1 apartment case
      apartment.findOne({ _id: householdFound.apartments[0] })
    ]);

    json.members = json.members.map((_, i) => ({
      ...mem[i]._doc,
      relation_to_head: householdFound.members[i].relation_to_head
    }));
    
    res.status(200).json({ message: "Success", household: json });
  } catch (error) {
    res.status(500).json(error);
  }
};

const editHouseholdMember = async (req, res) => {
  try {
    const id = req.query;
    const { member_id, relation_to_head } = req.body;
    if (!mongoose.isValidObjectId(id))
      res.status(400).json({ message: 'Invalid household' });

    const householdFound = await household.findOne({ _id: id });
    if(!householdFound) 
      res.status(400).json({ message: 'Invalid household' });
  
    const members = householdFound.members.map(person => person.member_id !== member_id);
    members.push({ member_id, relation_to_head });
    householdFound.members = members;
    await householdFound.save();
    res.status(200).json({ message: "Success", household: householdFound._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

const addNewMember = async (req, res) => {
  try {
    const { number, id, relationToOwner, ...householdInfo } = req.body;
    const apartmentFound = await apartment.findOne({ number: number });
    if(!apartmentFound.household)
      return res.status(402).json({ message: "Invalid apartment" });
    const householdFound = await household.findOne({ _id: apartmentFound.household });
    if(!householdFound) 
      return res.status(402).json({ message: 'Invalid household' });
    
    if(householdFound.members.includes({ member_id: id, relation_to_head: relationToOwner }))
      return res.status(407).json({ message: "Person is already in household" })
    householdFound.members.push({ member_id: id, relation_to_head: relationToOwner });
    await householdFound.save();

    await person.findByIdAndUpdate(id, { householdId: householdFound._id });
    return res.status(200).json({ message: "Success", household: householdFound._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteHouseholdMember = async (req, res) => {
  try {
    const { id } = req.query;
    const { selectedRows } = req.body;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'Invalid household' });

    const householdFound = await household.findOne({ _id: id });
    if(!householdFound) 
      return res.status(400).json({ message: 'Invalid household' });

    const newHouseholdMembers = householdFound.members.filter(per => selectedRows.includes(per));
    for (const deleteMember of selectedRows) {
      await person.deleteOne({_id: deleteMember.key});
    }

    householdFound.members = newHouseholdMembers;
    await householdFound.save();
    res.status(200).json({ message: "Success", household: householdFound._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getHouseholds,
  createHousehold,
  editHousehold,
  deleteHousehold,
  getHouseholdDetail,
  addNewMember,
  editHouseholdMember,
  deleteHouseholdMember
};
