import axios from 'axios';

export const setFees = (fees) => ({
  type: "SET_FEES",
  payload: fees,
});
export const setHouseholdDetail = (households) => ({
  type: "SET_HOUSEHOLD",
  payload: households,
});
export const setDoneFees = (fees) => ({
  type: "SET_DONE_FEES",
  payload: fees,
});

export const fetchFees = (household_id) => {
  return (dispatch) => {
    axios.get(`http://localhost:8386/payments/api/v1/payments?household_id=${household_id}`)  
      .then(response => {
        setFees(dispatch(setFees(response.data)));
      })
      .catch(error => {
        console.error("Error fetching fees data:", error);
      });
  };
};

export const fetchDoneFees = (household_id) => {
  return (dispatch) => {
    axios.get(`http://localhost:8386/payments/api/v1/payments?household_id=${household_id}&&status=done`)  
      .then(response => {
        setDoneFees(dispatch(setFees(response.data)));
      })
      .catch(error => {
        console.error("Error fetching fees data:", error);
      });
  };
};

export const fetchHouseholdDetail = (household_id) => {
  return (dispatch) => {
    return axios.get(`http://localhost:8386/household/api/v1/all?id=${household_id}`)
      .then(response => {
        dispatch(setHouseholdDetail(response.data));
      })
      .catch(error => {
        console.error("Error fetching household details:", error);
      });
  };
};
