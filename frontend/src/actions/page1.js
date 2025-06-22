export const setHouseholds = (households) => ({
  type: "SET_HOUSEHOLDS",
  payload: households
});

export const setDashboardData = (data) => ({
  type: "SET_DASHBOARD_DATA",
  payload: data
});

export const fetchHouseholds = (page) => {
  fetch(`http://localhost:8386/household/api/v1/all?page=${page}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.status === 200) return res.json();
    })
    .then((data) => {
      localStorage.setItem(`households_page_${page}`, JSON.stringify(data));
      return data;
    });
};

export const fetchDashboardData = () => {
  return (dispatch) => {
    fetch("http://localhost:8386/api/v1/dashboard", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.status === 200) return res.json();
      })
      .then((data) => {
        dispatch(setDashboardData(data));
      });
  };
};
