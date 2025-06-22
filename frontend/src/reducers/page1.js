const initialState = {
  households: [],
  recentCustomers: [],
  numApartment: 0,
  numPerson: 0,
  numTemporary: 0,
  numAbsence: 0,
  totalItems: 0,
  limitItem: 8,
};

const page1Reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_HOUSEHOLDS":
      return {
        ...state,
        households: action.payload.households,
        totalItems: action.payload.totalItems,
        limitItem: action.payload.limitItem
      };

    case "SET_DASHBOARD_DATA":
      return {
        ...state,
        numApartment: action.payload?.numApartment,
        numPerson: action.payload?.numPerson,
        numTemporary: action.payload?.numTemporary,
        numAbsence: action.payload?.numAbsence,
        recentCustomers: action.payload?.recentCustomers,
      };

    default:
      return state;
  }
};

export default page1Reducer;
