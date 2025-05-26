const initialState = {
  totalPayments: [], // Khởi tạo state rỗng
  limitItem: 8,
  totalItems: 32,
  currentPage: 1
};

const feeManageReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ALL_PAYMENTS":
      return {
        ...state,
        totalPayments: action.payload.totalPayments, // Cập nhật totalPayments
        limitItem: action.payload.limitItem,
        totalItems: action.payload.totalItems,
        currentPage: action.payload.currentPage
      };
    default:
      return state;
  }
};

export default feeManageReducer;