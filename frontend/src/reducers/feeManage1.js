const initialState = {
    totalPayments: [], // Khởi tạo state rỗng
  };
  
  const feeManageReducer1 = (state = initialState, action) => {
    switch (action.type) {
        case "SET_TOTAL_PAYMENT":
          return {
            ...state,
            totalPayment: action.payload, // Cập nhật totalPayment
          };
      default:
        return state;
    }
  };
  
  export default feeManageReducer1;