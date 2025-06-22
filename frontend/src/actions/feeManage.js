import axios from "axios"

// Actions
export const setAllPayments = (totalPayments) => ({
  type: "SET_ALL_PAYMENTS",
  payload: totalPayments
});

export const setTotalPayments = (totalPayments) => ({
  type: "SET_TOTAL_PAYMENTS",
  payload: totalPayments
});

export const setTotalPayment = (totalPayment) => ({
  type: "SET_TOTAL_PAYMENT",
  payload: totalPayment
});

export const setError = (error) => ({
  type: "SET_ERROR",
  payload: error
});

export const fetchTotalPayments = (params) => async (dispatch) => {
  try {
    // Lọc các tham số hợp lệ
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(
        ([key, value]) => value !== null && value !== undefined && value !== ''
      )
    );

    // Tạo query string từ các tham số hợp lệ
    const queryString = new URLSearchParams(filteredParams).toString();

    console.log('Filtered Query String:', queryString);

    // Gửi yêu cầu đến API
    const response = await axios.get(`http://localhost:8386/payments/api/v1/payments?${queryString}`);
    
    // Kiểm tra dữ liệu từ response
    if (response && response.data) {
      dispatch(setTotalPayments({
        totalPayments: response.data.array || [],
        limitItem: response.data.limitItem || 0,
        totalItems: response.data.totalItems || 0,
        currentPage: response.data.currentPage || 1,
      }));
    } else {
      console.error('Unexpected response format:', response);
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
  }
};


export const fetchAllPayments = () => {
  return async (dispatch) => {
    const response = await axios.get(`http://localhost:8386/payments/api/v1/payments`);
    const limitItem = response.data.limitItem;  
    const totalItems = response.data.totalItems;  
    const totalPages = Math.ceil(totalItems / limitItem); // Tính số trang cần lấy

    let allPaymentsData = [];

    for (let page = 1; page <= totalPages; page++) {
      try {
        const response = await axios.get(`http://localhost:8386/payments/api/v1/payments?page=${page}`);
        allPaymentsData = [...allPaymentsData, ...response.data.array];  // Gộp dữ liệu vào array
      } catch (error) {
        console.error("Error fetching payments on page", page, error);
        break;
      }
    }
    dispatch(setAllPayments({
      totalPayments: allPaymentsData,
      limitItem: limitItem,
      totalItems: totalItems
    }));
  };
};

export const fetchTotalPayment = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get("http://localhost:8386/payments/api/v1/totalPayment");
      dispatch(setTotalPayment(response.data.data)); 
    } catch (error) {
      dispatch(setError("Failed to fetch total payment"));
      console.error("Error fetching total payment:", error);
    }
  };
};
