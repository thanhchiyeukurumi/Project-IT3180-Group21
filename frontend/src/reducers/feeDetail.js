const initialState = {
  fees: [],
  sortedFees: null,
};

const feeDetailReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_FEES":
      return {
        ...state,
        fees: action.payload,
      };
    default:
      return state;
  }
};

export default feeDetailReducer;
