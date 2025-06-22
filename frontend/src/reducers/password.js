const initialState = {
  loading: false,
  successMessage: "",
  errorMessage: "",
};

const passwordReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHANGE_PASSWORD_REQUEST":
      return { ...state, loading: true, successMessage: "", errorMessage: "" };
    case "CHANGE_PASSWORD_SUCCESS":
      return { ...state, loading: false, successMessage: action.payload.message, errorMessage: "" };
    case "CHANGE_PASSWORD_FAILURE":
      return { ...state, loading: false, successMessage: "", errorMessage: action.error };
    default:
      return state;
  }
};

export default passwordReducer;
