import "./style.css"
import {useState, useEffect} from "react"
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { fetchFees, fetchHouseholdDetail } from "../../actions";
import { DatePicker, Form } from 'antd';
import dayjs from 'dayjs';
import { HistoryOutlined } from "@ant-design/icons";

function Detail(){
  const dispatch = useDispatch();
  const { household_id } = useParams();
  const fees = useSelector(state => state.feeDetailReducer.fees);
  const households = useSelector(state => state.householdDetailReducer.households.array);
  console.log(households);
  // State để lưu tháng chọn
  const [selectedMonth, setSelectedMonth] = useState(dayjs());  // Mặc định là tháng hiện tại
  useEffect(() => {
    Promise.all([
      dispatch(fetchFees(household_id)),      // Gọi API fetchFees
      dispatch(fetchHouseholdDetail(household_id)) // Gọi API fetchHouseholdDetails
    ])
    .catch((error) => {
      console.error("Error in one or both API calls:", error);
    });
  }, [dispatch, household_id]);
  if (!fees || !households || households.length === 0) {
    return <div>Đang tải dữ liệu...</div>;
  }

  // Lọc các khoản phí theo tháng đã chọn
  const filteredFees = fees.array?.filter((fee) => {
    if (!selectedMonth) return true; // Nếu không có tháng chọn, hiển thị tất cả
    const feeMonth = dayjs(fee.payment_date);  // Giả sử fee.payment_date là ngày thanh toán
    return feeMonth.month() === selectedMonth.month() && feeMonth.year() === selectedMonth.year();
  });

  const sortedFees = filteredFees?.sort((a, b) => {
    if (a.status === 'Chưa thanh toán' && b.status === 'Đã thanh toán') {
      return -1; // 'Chưa thanh toán' lên trước
    }
    if (a.status === 'Đã thanh toán' && b.status === 'Chưa thanh toán') {
      return 1; // 'Đã thanh toán' xuống sau
    }
    return 0; // Giữ nguyên thứ tự nếu đều giống nhau
  });
    
  return (
    <>
      <div className="details__fee">
        <div className="recentCt">
          <div className="cardHeader">
              <h2>Chi tiết hoá đơn của hộ: {households[0]?.head || "Loading...."}</h2>
              <div className="filter-month">
                <Form.Item label="Thời gian:">
                <DatePicker 
                  picker="month" 
                  value={selectedMonth} 
                  onChange={(date) => setSelectedMonth(date || dayjs())} 
                  format="MM/YYYY"
                />
                </Form.Item>
              </div>
              <div className="all-button">
                <Link to={`/transactionHis/${household_id}`} className="btn"><HistoryOutlined /></Link>
                <Link to="/stats" className="btn">Quay lại</Link>
              </div>
          </div>

          <table>
            <thead>
              <tr>
                <td>Loại phí</td>
                <td>Số đơn vị</td>
                <td>Số tiền</td>
                <td>Hạn nộp</td>
                <td>Tình trạng</td>
                <td>Trạng thái</td>
              </tr>
            </thead>
            <tbody>
              {sortedFees?.map((fee, index) => (
                <tr key={index}>
                  <td>{fee.payment_name}</td>
                  <td>{fee.count}</td>
                  <td> {(fee.amount*fee.count).toLocaleString("vi-VN")} VNĐ</td>
                  <td>
                    {fee.payment_date ? new Date(fee.payment_date).toLocaleDateString('vi-VN') : 'Chưa có ngày'}                                     
                  </td>
                  <td>
                    {fee.payment_date && new Date(fee.payment_date) <= new Date() ? 'Đến hạn thanh toán' : 'Chưa đến hạn thanh toán'}
                  </td>
                  <td>
                      <span className={fee.status === 'Đã thanh toán' ? 'status-paid' : 'status-unpaid'}>
                        {fee.status === 'Đã thanh toán' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
export default Detail