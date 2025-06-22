import axios from "axios";

export const setPayments = (payments) => ({
  type: "SET_PAYMENTS",
  payload: payments
});

export const fetchPayments = () => {
  return (dispatch) => {
    axios
      .get("http://localhost:8386/payments/api/v1/payments?limit=3&status=done")
      .then((response) => {
        dispatch(setPayments(response.data));
      })
      .catch((error) => {
        console.error("Error fetching fees data:", error);
      });
  };
};
