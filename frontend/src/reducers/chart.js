const initialState = {
  payments: [],
  totalPaymentData: [],
};

const chartReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_PAYMENTS":
      return {
        ...state,
        payments: action.payload,
      };
    default:
      return state;
  }
};

export default chartReducer;