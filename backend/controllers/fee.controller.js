const Fee = require("../models/fee.js");
const Household = require("../models/household.js");
const Payment = require("../models/payment.js");
const searchHelper = require("../helpers/search.js");
//[GET] fees/api/v1/fees
module.exports.index = async (req, res) => {
  try {
    const find = {};
    if (req.query.name) {
      find.name = req.query.name;
    }
    //Search
    let objectSearch = searchHelper(req.query);
    if (req.query.keyword) {
      find.name = objectSearch.regex;
    }
    //End Search
    //Sort
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }
    //End Sort

    //Pagination
    let pagination = {
      currentPage: 1,
      limitItem: 8
    };
    if (req.query.page){
      pagination.currentPage= parseInt(req.query.page);
    }
    const skip = (pagination.currentPage - 1) * pagination.limitItem;
    pagination.totalItems = await Fee.countDocuments(find);
    pagination.totalPage = Math.ceil(pagination.totalItems / pagination.limitItem);
    //End Pagination

    const fees = await Fee.find(find).sort(sort).skip(skip).limit(pagination.limitItem);
    
    if (!fees) {
      return res.status(404).json({ message: "Not Found" });
    } else {
      let results = { ...pagination, array: [] };
      results.array = fees.map((fee) => ({
        ...fee._doc,
      }));
      res.json(results);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
//[POST] /fees/api/v1/post
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
      householdsToAddPayment = await Household.find({}, "_id motobikes cars").populate({
        path: "apartments",
        select: "totalArea",
      });
    } else if (status === "Không bắt buộc" && households) {
      householdsToAddPayment = await Household.find(
        { _id: { $in: households } },
        "_id motobikes cars"
      ).populate({
        path: "apartments",
        select: "totalArea",
      });
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
        count = household.apartments && Array.isArray(household.apartments)
            ? household.apartments.reduce((total, apartment) => total + (apartment.totalArea || 0), 0)
            : 0;
      }
      if (count === 0 && (household.motobikes.length === 0 || household.cars.length === 0)) {
        return null; // Không tạo payment nếu không có xe máy hoặc ô tô
      }

      return {
        fee_id: fee._id,
        payment_id: generatePaymentID(),
        household_id: household._id,
        amount: fee.amount,
        payment_date: calculateDueDate(fee.due),
        status: "Chưa thanh toán",
        count,
      };
    }).filter(payment => payment !== null);

    await Payment.insertMany(payments);

    res.status(201).json({ message: "Fee created successfully", fee });
  } catch (error) {
    console.error("Error creating fee:", error);
    res.status(500).json({ message: "Error creating fee", error });
  }
};

//[POST] /fees/api/v1/change
// module.exports.changeFee = async (req, res) => {
//   try {
//     const { id, name, amount, due, status, households, ...otherFields } = req.body;

//     // Kiểm tra nếu không có ID
//     if (!id) {
//       return res.status(400).json({ message: "Thiếu ID của phí cần cập nhật!!!!" });
//     }

//     // Tìm phí hiện tại theo ID
//     const existingFee = await Fee.findById(id);
//     if (!existingFee) {
//       return res.status(404).json({ message: "Không tìm thấy phí với ID này." });
//     }

//     // Chuẩn bị các trường cần cập nhật
//     const updateFields = { ...otherFields };
//     if (name !== undefined) updateFields.name = name;
//     if (amount !== undefined) updateFields.amount = amount;
//     if (due !== undefined) updateFields.due = due;
//     if (status !== undefined) updateFields.status = status;

//     // Kiểm tra nếu không có trường nào để cập nhật
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({ message: "Không có trường nào để cập nhật!!!" });
//     }

//     // Cập nhật phí
//     const updatedFee = await Fee.findByIdAndUpdate(id, updateFields, { new: true });

//     // Xử lý logic trạng thái "Bắt buộc" và "Không bắt buộc"
//     if (status !== undefined && status !== existingFee.status) {
//       if (status === "Bắt buộc") {
//         // Chuyển từ "Không bắt buộc" sang "Bắt buộc"
//         const allHouseholds = await Household.find({}, "_id");
//         const existingPayments = await Payment.find({ fee_id: id }, "household_id");

//         // Lấy danh sách household chưa có payment
//         const existingHouseholdIds = existingPayments.map((payment) => payment.household_id.toString());
//         const missingPayments = allHouseholds.filter(
//           (household) => !existingHouseholdIds.includes(household._id.toString())
//         );

//         // Tạo payment mới cho các household thiếu
//         const newPayments = missingPayments.map((household) => ({
//           fee_id: id,
//           payment_id: generatePaymentID(),
//           household_id: household._id,
//           amount: updatedFee.amount,
//           payment_date: calculateDueDate(updatedFee.due),
//           status: "Chưa thanh toán",
//         }));

//         // Thêm các payment mới nếu có
//         if (newPayments.length > 0) {
//           await Payment.insertMany(newPayments);
//         }
//       } else if (status === "Không bắt buộc") {
//         // Chuyển từ "Bắt buộc" sang "Không bắt buộc"
//         if (households && households.length > 0) {
//           const householdIdsToApply = households.map((householdId) => householdId.toString());

//           // Xóa các payment không nằm trong danh sách households mới
//           await Payment.deleteMany({
//             fee_id: id,
//             household_id: { $nin: householdIdsToApply },
//           });

//           // Lấy danh sách các hộ cần thêm payment mới
//           const existingPayments = await Payment.find({ fee_id: id }, "household_id");
//           const existingHouseholdIds = existingPayments.map((payment) => payment.household_id.toString());
//           const missingHouseholds = households.filter(
//             (householdId) => !existingHouseholdIds.includes(householdId.toString())
//           );

//           // Thêm các payment mới nếu cần
//           const newPayments = missingHouseholds.map((householdId) => ({
//             fee_id: id,
//             payment_id: generatePaymentID(),
//             household_id: householdId,
//             amount: updatedFee.amount,
//             payment_date: calculateDueDate(updatedFee.due),
//             status: "Chưa thanh toán",
//           }));

//           if (newPayments.length > 0) {
//             await Payment.insertMany(newPayments);
//           }
//         } else {
//           // Nếu không có danh sách households, xóa tất cả payments liên quan
//           await Payment.deleteMany({ fee_id: id });
//         }
//       }
//     }
//     if(status === existingFee.status && status ==="Không bắt buộc"){
//       if (households && households.length > 0) {
//         const householdIdsToApply = households.map((householdId) => householdId.toString());

//         // Xóa các payment không nằm trong danh sách households mới
//         await Payment.deleteMany({
//           fee_id: id,
//           household_id: { $nin: householdIdsToApply },
//         });

//         // Lấy danh sách các hộ cần thêm payment mới
//         const existingPayments = await Payment.find({ fee_id: id }, "household_id");
//         const existingHouseholdIds = existingPayments.map((payment) => payment.household_id.toString());
//         const missingHouseholds = households.filter(
//           (householdId) => !existingHouseholdIds.includes(householdId.toString())
//         );

//         // Thêm các payment mới nếu cần
//         const newPayments = missingHouseholds.map((householdId) => ({
//           fee_id: id,
//           payment_id: generatePaymentID(),
//           household_id: householdId,
//           amount: updatedFee.amount,
//           payment_date: calculateDueDate(updatedFee.due),
//           status: "Chưa thanh toán",
//         }));

//         if (newPayments.length > 0) {
//           await Payment.insertMany(newPayments);
//         }
//       } else {
//         // Nếu không có danh sách households, xóa tất cả payments liên quan
//         await Payment.deleteMany({ fee_id: id });
//       }
//     }

//     // Cập nhật số tiền cho tất cả các payment nếu amount thay đổi
//     if (amount !== undefined && amount !== existingFee.amount) {
//       await Payment.updateMany(
//         { fee_id: id },
//         { $set: { amount: amount } }
//       );
//     }
//     if (due !== undefined && due !== existingFee.due) {
//       await Payment.updateMany(
//         { fee_id: id },
//         { $set: { payment_date: calculateDueDate(updatedFee.due) } }
//       );
//     }

//     res.status(200).json({ message: "Cập nhật thành công!", data: updatedFee });
//   } catch (error) {
//     console.error("Lỗi khi cập nhật:", error);
//     res.status(500).json({ message: "Lỗi khi cập nhật!", error });
//   }
// };
module.exports.changeFee = async (req, res) => {
  try {
    const { id, name, amount, due, status, households, ...otherFields } = req.body;

    // Kiểm tra nếu không có ID
    if (!id) {
      return res.status(400).json({ message: "Thiếu ID của phí cần cập nhật!!!!" });
    }

    // Tìm phí hiện tại theo ID
    const existingFee = await Fee.findById(id);
    if (!existingFee) {
      return res.status(404).json({ message: "Không tìm thấy phí với ID này." });
    }

    // Chuẩn bị các trường cần cập nhật
    const updateFields = { ...otherFields };
    if (name !== undefined) updateFields.name = name;
    if (amount !== undefined) updateFields.amount = amount;
    if (due !== undefined) updateFields.due = due;
    if (status !== undefined) updateFields.status = status;

    // Kiểm tra nếu không có trường nào để cập nhật
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "Không có trường nào để cập nhật!!!" });
    }

    // Cập nhật phí
    const updatedFee = await Fee.findByIdAndUpdate(id, updateFields, { new: true });

    // Lấy danh sách households cần cập nhật
    let householdsToUpdatePayments = [];
    if (status === "Bắt buộc") {
      householdsToUpdatePayments = await Household.find({}, "_id motobikes cars").populate({
        path: "apartments",
        select: "totalArea",
      });
    } else if (status === "Không bắt buộc" && households) {
      householdsToUpdatePayments = await Household.find(
        { _id: { $in: households } },
        "_id motobikes cars"
      ).populate({
        path: "apartments",
        select: "totalArea",
      });
    }

    // Tính lại `count` và cập nhật hoặc thêm mới Payment
    const paymentsToUpdate = householdsToUpdatePayments.map((household) => {
      let count = 0;
      if (name === "Phí gửi xe máy") {
        count = household.motobikes.length;
      } else if (name === "Phí gửi ô tô") {
        count = household.cars.length;
      } else if (name === "Phí từ thiện") {
        count = 1;
      } else {
        count = household.apartments && Array.isArray(household.apartments)
          ? household.apartments.reduce((total, apartment) => total + (apartment.totalArea || 0), 0)
          : 0;
      }

      if (count === 0 && (household.motobikes.length === 0 || household.cars.length === 0)) {
        return null; // Không tạo payment nếu không có xe máy hoặc ô tô
      }

      return {
        fee_id: id,
        payment_id: generatePaymentID(),
        household_id: household._id,
        amount: updatedFee.amount,
        payment_date: calculateDueDate(updatedFee.due),
        status: "Chưa thanh toán",
        count,
      };
    }).filter(payment => payment !== null);

    // Xóa các Payment cũ và thêm mới
    await Payment.deleteMany({ fee_id: id });
    await Payment.insertMany(paymentsToUpdate);

    res.status(200).json({ message: "Cập nhật thành công!", data: updatedFee });
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật!", error });
  }
};


function generatePaymentID() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};
function calculateDueDate(due) {
  const now = new Date();
  now.setMonth(now.getMonth() + due); // Cộng thêm số tháng hạn vào tháng hiện tại
  return now;
}

//[POST] /payments/api/v1/delete
module.exports.deleteFee = async (req,res) => {
  try {
    const { id } = req.body;
    await Payment.deleteMany({ fee_id: id });
    await Fee.deleteOne(
      {
        _id:id
      });

    res.status(201).json({message: "Delete Fee Success"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete Fee Error", error });
  }
};
