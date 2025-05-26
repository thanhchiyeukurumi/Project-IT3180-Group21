const initialState = {
    fees: [],
    sortedFees: null,
  };
  
  const feeDetailReducerDone = (state = initialState, action) => {
    switch (action.type) {
      case "SET_DONE_FEES":
        return {
          ...state,
          fees: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default feeDetailReducerDone;
  