const initialState = {
  totalPayments: [], // Khởi tạo state rỗng
  limitItem: 8,
  totalItems: 41,
  currentPage: 1
};

const feePageReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_TOTAL_PAYMENTS":
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

export default feePageReducer;