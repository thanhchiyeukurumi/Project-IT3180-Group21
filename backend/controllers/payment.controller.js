const Payment = require("../models/payment.js");
const Fee = require("../models/fee.js");
const Household = require('../models/household.js');
const Person = require('../models/person.js');

//[GET] payments/api/v1/payments
module.exports.index = async (req, res) => {
  try {
    // Build query filter
    const filter = {};
    const householdFilter = {};
    if (req.query.fee_id) {
      filter.fee_id = req.query.fee_id;
    }
    if (req.query.household_id) {
      filter.household_id = req.query.household_id;
    }
    if (req.query.status == 'done'){
      filter.status = 'Đã thanh toán';
    }
    if (req.query.status == 'undone'){
      filter.status = 'Chưa thanh toán';
    }
    // Lọc Fee theo feeName
    if (req.query.feeName) {
      const fees = await Fee.find({ name: req.query.feeName }).select('_id').lean();
      const feeIds = fees.map(fee => fee._id.toString());
      filter.fee_id = { $in: feeIds };
    }
    //Lọc Household theo HouseholdHead
    if (!req.query.household_id){
      if (req.query.householdHead) {
        const headPersons = await Person.find({ name: req.query.householdHead }).select('_id').lean();
        const headPersonIds = headPersons.map(person => person._id.toString());
        householdFilter.head = { $in: headPersonIds };
      }
      const Households = await Household.find(householdFilter).select('_id').lean();
      const HouseholdIds = Households.map(household => household._id.toString());
      if (HouseholdIds.length > 0) {
        filter.household_id = { $in: HouseholdIds };
      }
    }
    // Lọc theo ngày
    if (req.query.fromDate || req.query.toDate) {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
      const toDate = req.query.toDate ? new Date(req.query.toDate) : null;
    
      // Kiểm tra tính hợp lệ của ngày
      if (fromDate && isNaN(fromDate)) {
        return res.status(400).json({ message: 'Ngày bắt đầu không hợp lệ' });
      }
      if (toDate && isNaN(toDate)) {
        return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ' });
      }
    
      // Tạo filter.payment_date nếu chưa có
      if (!filter.payment_date) {
        filter.payment_date = {};
      }
    
      // Áp dụng điều kiện lọc
      if (fromDate) filter.payment_date.$gte = fromDate;
      if (toDate) filter.payment_date.$lte = toDate;
    }
    

    //Pagination
    let pagination = {
      currentPage:1,
      limitItem:8
    };
    if (req.query.page) {
      pagination.currentPage= parseInt(req.query.page);
    }
    const skip = (pagination.currentPage - 1) * pagination.limitItem;
    pagination.totalItems = await Payment.countDocuments(filter);
    pagination.totalPage = Math.ceil(pagination.totalItems / pagination.limitItem);

    //End Pagination
    // const sort = {};
    // if (req.query.sortKey && req.query.sortValue) {
    //   sort[req.query.sortKey] = parseInt(req.query.sortValue) || 1;
    // } else {
    //   sort.createdAt = -1;
    // }
    pagination.limitItem = req.query.limit ? parseInt(req.query.limit) : 8;
    let payments = await Payment.find(filter)
      // .sort(sort)
      .lean().skip(skip).limit(pagination.limitItem);

    //Truy vấn tên hộ gia đình
    const householdIds = [...new Set(payments.map(payment => payment.household_id))];
    const households = await Household.find({
      _id: { $in: householdIds }
    }).lean();

    const householdMap = households.reduce((acc, household) => {
      acc[household._id.toString()] = household;
      return acc;
    }, {});

    const personIds = households.map(household => household.head);
    const persons = await Person.find({
      _id: { $in: personIds }
    }).lean();

    const personMap = persons.reduce((acc, person) => {
      acc[person._id.toString()] = person;
      return acc;
    }, {});

    
    // Lấy danh sách fee_id duy nhất từ payments
    const feeIDs = [...new Set(payments.map(payment => payment.fee_id).filter(Boolean))];
    const fees = await Fee.find({ 
      _id: { $in: feeIDs } 
    }).select('name').lean();

    const feeMap = fees.reduce((acc, fee) => {
      acc[fee._id.toString()] = fee.name;
      return acc;
    }, {});

    let results = { ...pagination, array: [] };
    results.array = payments.map(payment => {
      const household = householdMap[payment.household_id.toString()];
      const headPerson = household && household.head ? personMap[household.head.toString()] : null;
      const paymentDateObj = new Date(payment.payment_date);
      const month = paymentDateObj.getMonth() + 1;
      const year = paymentDateObj.getFullYear();
      const householdHead = headPerson ? headPerson.name : "Unknown";
      const feeName = feeMap[payment.fee_id?.toString()] || "Unknown";
      const payment_name = `${feeMap[payment.fee_id?.toString()]} tháng ${month}/${year}`;

      return {
        ...payment,
        householdHead,
        feeName,
        payment_name,
      };
    }).filter(payment => payment !== null);;
    res.json(results);
  } catch (error) {
    console.error('Payment index error:', error);
    res.status(500).json({ 
      message: "Server Error",
    });
  }
};

//[POST] /payments/api/v1/post
module.exports.addPayment = async (req, res) => {
  try {
    const { fee_id, household_id, amount, payment_date } = req.body;
    const payment = new Payment({
      fee_id: fee_id,
      household_id: household_id,
      amount,
      payment_date,
    });

    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating payment", error });
  }
};

//[POST] /payments/api/v1/change
module.exports.changePayment = async (req,res) => {
  try {
    const { payment_id,bill_id } = req.body;
    const payment = await Payment.findOne({ payment_id });

    if (!payment) {
      return res.status(404).json({ message: 'Thanh toán không tồn tại' });
    }

    // Kiểm tra nếu trạng thái đã là "Đã thanh toán"
    if (payment.status === 'Đã thanh toán') {
      return res.status(400).json({ message: 'Thanh toán đã được hoàn tất' });
    }

    // Cập nhật trạng thái thanh toán
    payment.status = 'Đã thanh toán';
    await payment.save();

    res.status(200).json({ message: 'Thanh toán đã được cập nhật thành công', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

//[POST] /payments/api/v1/changes
module.exports.changePayments = async (req,res) => {
  const { payment_ids,bill_id,bill_time } = req.body; // Gửi danh sách payment_id qua body
  try {
    // Kiểm tra nếu không có payment_ids
    if (!payment_ids || !Array.isArray(payment_ids) || payment_ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách payment_id không hợp lệ' });
    }

    // Cập nhật nhiều thanh toán
    const updatedPayments = await Payment.updateMany(
      { payment_id: { $in: payment_ids }, status: 'Chưa thanh toán' },  // Tìm các payment chưa thanh toán
      { $set: { status: 'Đã thanh toán', bill_id:bill_id ,bill_time:bill_time} }
    );

    if (updatedPayments.nModified === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán nào cần thay đổi' });
    }

    res.status(200).json({ message: 'Cập nhật thanh toán thành công', updatedPayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

//[POST] /payments/api/v1/delete
module.exports.deletePayment = async (req,res) => {
  try {
    const { fee_id, household_id } = req.body;
    await Payment.deleteOne(
      {
        fee_id:fee_id,
        household_id:household_id
      });

    res.status(201).json({message: "Delete Payment Success"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete Payment Error", error });
  }
};

//[GET] /payments/api/v1/totalPayment
module.exports.totalPayment = async (req,res) => {
  try {
    const findHousehold = {};
    const households = await Household.find(findHousehold);
    if(!households) {
      return res.status(404).json({ message: "Not Found" });
    } else {
      const results = [];
      for (const household of households) {
        const householdId = household._id;
        //Sum payments
        const  payments = await Payment.aggregate([
          {$match:{
            household_id:householdId.toString(),
          }},
          {$group:{_id:householdId.toString(),totalAmount: {$sum:{ $multiply: ["$amount", "$count"] }}}}
        ]);
        const  paymented = await Payment.aggregate([
          {$match:{
            household_id:householdId.toString(),
            status: { $ne: "Đã thanh toán" }
          }},
          {$group:{_id:householdId.toString(),totalAmount: {$sum:{ $multiply: ["$amount", "$count"] }}}}
        ]);
        //Nếu không có khoản thanh toán nào,sum = 0
        const payed = paymented.length > 0 ? paymented[0].totalAmount : 0;
        const totalAmount = payments.length > 0 ? payments[0].totalAmount : 0;
        //Thông tin chủ hộ
        const headPerson = await Person.findById(household.head).select('name');
        const headName = headPerson ? headPerson.name : "Unknown";

        results.push({
          household_id: householdId,
          headName,
          payed,
          totalAmount
        });
      }
      res.status(200).json({data:results});
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Hàm tự động tạo payment mỗi tháng
const generatePaymentID = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
const calulateDueDate = (monthsToAdd) => {
  const now = new Date();
  const dueDate = new Date(now);

  dueDate.setMonth(now.getMonth() + monthsToAdd);
  return dueDate;
};

module.exports.addFee = async (req, res) => {
  try {
    const { name, amount, due, status, households } = req.body;
    const fee = new Fee({
      name,
      amount,
      due,
      status,
    });
    await fee.save();

    let householdsToAddPayment = [];
    if (status === "Bắt buộc") {
      householdsToAddPayment = await Household.find({}, "_id motobikes cars apartments");
    } else if (status === "Không bắt buộc" && households) {
      householdsToAddPayment = await Household.find(
        { _id: { $in: households } },
        "_id motobikes cars apartments"
      );
    }

    const payments = householdsToAddPayment.map((household) => {
      let count = 0;
      if (name === "Phí gửi xe máy") {
        count = household.motobikes.length;
      } else if (name === "Phí gửi ô tô") {
        count = household.cars.length;
      } else if (name === "Phí từ thiện"){
        count = 1;
      }
      else {
        count = household.apartments.length;
      }

      if (count === 0 && (household.motobikes.length === 0 || household.cars.length === 0)) {
        return null; // Không tạo payment nếu không có xe máy hoặc ô tô
      }

      return {
        fee_id: fee._id,
        payment_id: generatePaymentID(),
        household_id: household._id,
        amount: fee.amount,
        payment_date: calulateDueDate(fee.due),
        status: "Chưa thanh toán",
        count,
      };
    }).filter(payment => payment !== null);

    if (payments.length > 0) {
      await Payment.insertMany(payments);
    }

    res.status(201).json({ message: "Fee created successfully", fee });
  } catch (error) {
    console.error("Error creating fee:", error);
    res.status(500).json({ message: "Error creating fee", error });
  }
};

module.exports.autoGeneratePayments = async () => {
  try {
    const mandatoryFees = await Fee.find({ status: "Bắt buộc" });

    for (const fee of mandatoryFees) {
      const households = await Household.find({}, "_id motobikes cars").populate({
        path: "apartments",
        select: "totalArea",
      });

      const payments = households.map((household) => {
        let count = 0;
        if (fee.name === "Phí gửi xe máy") {
          count = household.motobikes.length;
        } else if (fee.name === "Phí gửi ô tô") {
          count = household.cars.length;
        } else {
          count = household.apartments && Array.isArray(household.apartments)
            ? household.apartments.reduce((total, apartment) => total + (apartment.totalArea || 0), 0)
            : 0;
        }
        if (count === 0 && (household.motobikes.length === 0 || household.cars.length === 0)) {
          return null;
        }

        return {
          fee_id: fee._id,
          household_id: household._id,
          amount: fee.amount,
          payment_date: calulateDueDate(fee.due),
          status: "Chưa thanh toán",
          payment_id: generatePaymentID(),
          count,
        };
      }).filter(payment => payment !== null);;

      if (payments.length > 0) {
        await Payment.insertMany(payments);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tạo payment tự động:", error);
  }
};