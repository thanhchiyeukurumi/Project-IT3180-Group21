const initialState = {
    households: [],
  };
  
  const householdDetailReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_HOUSEHOLD": 
        return {
          ...state,
          households: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default householdDetailReducer;
  