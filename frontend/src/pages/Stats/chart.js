import "./stats.scss";
import profile from "./images/profile-1.jpg";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments, fetchTotalPayment } from "../../actions";

function Chart() {
  const dispatch = useDispatch();
  const payments = useSelector((state) => state.chartReducer.payments);
  const totalPaymentData = useSelector((state) => state.feeManageReducer1.totalPayment || []);
  const r = 30;

  const payFull = totalPaymentData.reduce(
      (payFull, item) =>
        (item.totalAmount-item.payed) === item.totalAmount ? payFull + 1 : payFull,
      0
    ) || 0;

  const payment = totalPaymentData.reduce((sum, item) => sum + (item.totalAmount-item.payed), 0) || 0;
  const total = totalPaymentData.reduce((sum, item) => sum + item.totalAmount, 0) || 0;

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchTotalPayment());
  }, [dispatch]);

  const mainRef = useRef(null);
  const recentUpdatesRef = useRef(null);

  const syncHeight = () => {
    if (mainRef.current && recentUpdatesRef.current) {
      recentUpdatesRef.current.style.height = `${mainRef.current.offsetHeight}px`;
    }
  };

  useEffect(() => {
    syncHeight();
    window.addEventListener("resize", syncHeight);
    // Cleanup để tránh rò rỉ sự kiện
    return () => {
      window.removeEventListener("resize", syncHeight);
    };
  }, []);
  // if (!totalPaymentData.length) {
  //   return <p>Loading...</p>;
  // }
  return (
    <>
      {/* Insights Part */}
      <div className="container__header">
        <main>
          <h2>Biểu đồ</h2>
          <div className="insights">
            <div div className="pay-full" ref={mainRef}>
              <span className="material-symbols-sharp">trending_up</span>
              <div className="middle">
                <div className="left">
                  <h3>Số hộ đã nộp đủ</h3>
                  <h1>
                    {payFull}/{totalPaymentData.length}
                  </h1>
                </div>
                <div className="progress">
                  <svg>
                    <circle
                      r={r}
                      cy="40"
                      cx="40"
                      strokeDasharray={2 * Math.PI * r}
                      strokeDashoffset={
                        2 * Math.PI * r * (1 - payFull / totalPaymentData.length)
                      }
                      transform={`rotate(-90, 40, 40)`}
                    ></circle>
                  </svg>
                  <div className="number">
                    <p>{Math.floor((payFull / totalPaymentData.length) * 100)}%</p>
                  </div>
                </div>
              </div>
              <small>24h gần nhất</small>
            </div>

            <div className="payment">
              <span className="material-symbols-sharp">local_mall</span>
              <div className="middle">
                <div className="left">
                  <h3>Tổng thu</h3>
                  <h1>
                    {payment.toLocaleString("vi-VN")} VNĐ / {total.toLocaleString("vi-VN")} VNĐ
                  </h1>
                </div>
                <div className="progress">
                  <svg>
                    <circle
                      r={r}
                      cy="40"
                      cx="40"
                      strokeDasharray={2 * Math.PI * r}
                      strokeDashoffset={2 * Math.PI * r * (1 - payment / total)}
                      transform={`rotate(-90, 40, 40)`}
                    ></circle>
                  </svg>
                  <div className="number">
                    <p>{Math.floor((payment / total) * 100)}%</p>
                  </div>
                </div>
              </div>
              <small>24h gần nhất</small>
            </div>
          </div>
        </main>
        {/* <!------------------
         end main Insights
        ------------------->
      <!----------------
        start right main 
      ----------------------> */}
        <div className="right">
          <h2>Cập nhật gần đây</h2>
          <div className="recent_updates" ref={recentUpdatesRef}>
            <div className="updates">
              {payments.array?.map((payment, index) => (
                <div className="update" key={index}>
                  <img src={profile} alt="" />
                  <div className="message">
                    <p>
                      <b>{payment.householdHead}</b> Đã đóng {(payment.amount*payment.count).toLocaleString("vi-VN")}{" "}
                      VNĐ {payment.payment_name} 
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chart;