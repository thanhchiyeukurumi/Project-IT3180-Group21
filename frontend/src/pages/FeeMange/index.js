import React, { useState, useEffect, useMemo } from 'react';
import { Link } from "react-router-dom"
import "./style.css"
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments, fetchTotalPayments } from "../../actions/feeManage";
import { Form, Select, Col, Row, DatePicker, Modal, Input, Checkbox, InputNumber, Pagination } from 'antd';
import dayjs from 'dayjs';
import axios from "axios";
import { message } from "antd";

function FeeMange(){
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const allPayment = useSelector((state) => state.feeManageReducer.totalPayments);
  const totalPayment = useSelector((state) => state.feePageReducer.totalPayments);
  const limitItem = useSelector((state) => state.feeManageReducer.limitItem);
  const totalItems = useSelector((state) => state.feePageReducer.totalItems);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    dispatch(fetchAllPayments())
  },[])

  //Dữ liệu để lọc
  const householdName = [
    { value: "", label: "Tất cả" },
    ...[...new Set(allPayment?.map(Tpayment => Tpayment.householdHead))].map(householdHead => ({
      value: householdHead,
      label: householdHead,
    })),
  ];
  
  const paymentName = [
    { value: "", label: "Tất cả" },
    ...[...new Set(allPayment?.map(Tpayment => Tpayment.feeName))].map(feeName => ({
      value: feeName,
      label: feeName,
    })),
  ]

  const paymentStatus = [
    { value: "", label: "Tất cả" },
    ...[...new Set(allPayment?.map(Tpayment => Tpayment.status))].map(feeStatus => ({
      value: feeStatus,
      label: feeStatus,
    })),
  ]

  //Modal cập nhật
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkedPayments, setCheckedPayments] = useState([]);
  const [transactionID, setTransactionID] = useState("");
  const [transactionTime, setTransactionTime] = useState(dayjs());
  const [filters, setFilters] = useState({
    paymentName: null, 
    householdName: null, 
    fromDate: null,      
    toDate: null,
    paymentStatus: null      
  });

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: limitItem,
      feeName: filters.paymentName ? filters.paymentName : null,
      householdHead: filters.householdName ? filters.householdName : null,
      fromDate: filters.fromDate ? new Date(filters.fromDate) : null,
      toDate: filters.toDate ? new Date(filters.toDate) : null,
      status: filters.paymentStatus === "Đã thanh toán" ? "done" : filters.paymentStatus === "Chưa thanh toán" ? "undone" : null,
    };
    dispatch(fetchTotalPayments(params));
  }, [dispatch, currentPage, filters, limitItem]);
  

  const handleCheck = (paymentId) => {
    setCheckedPayments((prev) => {
      if (prev.includes(paymentId)) {
        return prev.filter((id) => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  // Hàm mở Modal
  const showModal = () => {
    setIsModalVisible(true);
    //Tạo ID giao dịch
    const generateTransactionID = () => {
      const now = new Date().getTime();
      const hash = now.toString(36);
      return hash.slice(-8); // Lấy 8 ký tự cuối
    };
    const transactionTime = dayjs().format('DD/MM/YYYY HH:mm:ss');
    const transactionID = generateTransactionID();
    setTransactionID(transactionID);
    setTransactionTime(transactionTime);
  };

  // Hàm đóng Modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const selectedPayments = useMemo(() => {
    return allPayment?.filter(payment => checkedPayments.includes(payment.payment_id));
  }, [allPayment, checkedPayments]);

  const totalAmount = selectedPayments?.reduce(
    (sum, item) =>
      sum += item.amount*item.count,
    0
  ) || 0;

  const handlePayment = async () => {
    try {
      // Gửi danh sách payment_id đến API
      const response = await axios.post("http://localhost:8386/payments/api/v1/changes", {
        payment_ids: selectedPayments?.map((payment) => payment.payment_id),
        bill_id:transactionID,
        bill_time: dayjs().toISOString(),
      });
  
      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        message.success(response.data.message); // Hiển thị thông báo thành công
        setReload(!reload);
        fetchAllPayments();
        const params = {
          page: currentPage,
          limit: limitItem,
          feeName: filters.paymentName ? filters.paymentName : null,
          householdHead: filters.householdName ? filters.householdName : null,
          fromDate: filters.fromDate ? new Date(filters.fromDate) : null,
          toDate: filters.toDate ? new Date(filters.toDate) : null,
          status: filters.paymentStatus === "Đã thanh toán" ? "done" : filters.paymentStatus === "Chưa thanh toán" ? "undone" : null,
        };
        dispatch(fetchTotalPayments(params));
        handleCancel(); // Đóng modal
        // Reset danh sách các hóa đơn đã được check
        setCheckedPayments([]); 
      } else {
        message.error("Có lỗi xảy ra khi thanh toán hóa đơn.");
      }
    } catch (error) {
      console.error("Error while updating payments:", error);
      message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
    }
  };

  console.log(totalPayment);

  return (
    <>
      <div className="details__fee">
        <div className="recentCt">
          <div className="cardHeader">
              <h2>Quản lý thu phí chung cư</h2>
              <Link to="/fee_list">
                <button className="btn">Danh sách các loại phí</button>
              </Link>
          </div>
          <div className="filter_fee">
            <Form
              layout="vertical"
            >
              <Row
                gutter={{
                  xs: 8,
                  sm: 16,
                  md: 24,
                  lg: 32,
                }}
              >
                <Col className="gutter-row" span={4.8}>
                  <Form.Item label="Tên khoản thu">
                    <Select 
                      placeholder="Chọn khoản thu" 
                      options={paymentName}
                      onChange={(value) => setFilters((prev) => ({ ...prev, paymentName: value }))}
                    >
                    </Select>
                  </Form.Item>
                </Col>
                <Col className="gutter-row" span={4.8}>
                  <Form.Item label="Tên chủ hộ">
                    <Select 
                      showSearch
                      placeholder="Chọn chủ hộ" 
                      filterOption={(input, option) => 
                        (option.label).includes(input)
                      }
                      options={householdName}
                      onChange={(value) => setFilters((prev) => ({ ...prev, householdName: value }))}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col className="gutter-row" span={4.8}>
                  <Form.Item label="Trạng thái">
                    <Select 
                      showSearch
                      placeholder="Chọn trạng thái" 
                      filterOption={(input, option) => 
                        (option.label).includes(input)
                      }
                      options={paymentStatus}
                      onChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col className="gutter-row" span={4.8}>
                  <Form.Item label="Từ ngày">
                    <DatePicker 
                      onChange={(date) => 
                        setFilters((prev) => ({ ...prev, fromDate: date ? dayjs(date).format('YYYY-MM-DD') : null }))
                      }
                    />
                  </Form.Item>
                </Col>
                <Col className="gutter-row" span={4.8}>
                  <Form.Item label="Đến ngày">
                    <DatePicker 
                      onChange={(date) => 
                        setFilters((prev) => ({ ...prev, toDate: date ? dayjs(date).format('YYYY-MM-DD') : null }))
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              
            </Form>
          </div>

          <table className='overall'>
            <thead>
              <tr>
                <td>ID hoá đơn</td>
                <td>Hạn nộp</td>
                <td>Tên hộ dân cư</td>
                <td>Tên khoản thu</td>
                <td>Số tiền cần thu</td>
                <td>Trạng thái</td>
                <td><button className="btn-details" onClick={showModal}>Cập nhật</button></td>
              </tr>
            </thead>
            <tbody>
              {totalPayment?.map((Tpayment, index) => (
                <tr key={index}>
                  <td>{Tpayment.payment_id}</td> {/* Hiển thị payment_id */}
                  <td>{dayjs(Tpayment.payment_date).format('DD/MM/YYYY')}</td> {/* Định dạng ngày nộp */}
                  <td>{Tpayment.householdHead}</td>
                  <td>{Tpayment.payment_name}</td> {/* Hiển thị tên khoản thu */}
                  <td>{Tpayment.amount && Tpayment.count ? Number(Tpayment.amount * Tpayment.count).toLocaleString("vi-VN"): "0"} VNĐ</td> {/* Định dạng số tiền */}
                  <td>{Tpayment.status}</td> {/* Hiển thị tên khoản thu */}
                  <td>
                    <Checkbox 
                      className='checkbox-btn'
                      checked={checkedPayments.includes(Tpayment.payment_id)} 
                      onChange={() => handleCheck(Tpayment.payment_id)}
                      disabled={Tpayment.status === "Đã thanh toán"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <Pagination
              current={currentPage}
              pageSize={limitItem}
              total={totalItems}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>

          <Modal
            title={`Thanh toán hoá đơn cho hộ: `}
            open={isModalVisible}
            onCancel={handleCancel}
            okText="Thanh toán"
            cancelText="Hủy"
            onOk={handlePayment}
          >
            <Form layout="horizontal">
              <Form.Item label="ID giao dịch">
                <Input value={transactionID} readOnly />
              </Form.Item>
              <hr/>
              <table className="payment">
                <thead>
                  <td>ID hoá đơn</td>
                  <td>Loại phí</td>
                  <td>Giá (VNĐ)</td>
                  <td>Hạn nộp</td>
                </thead>
                <tbody>
                  {selectedPayments?.map((Tpayment, index) => (
                    <tr key={index}>
                      <td>{Tpayment.payment_id}</td>
                      <td>{Tpayment.feeName}</td> 
                      <td>{Number(Tpayment.amount * Tpayment.count).toLocaleString('vi-VN')}</td>
                      <td>{dayjs(Tpayment.payment_date).format('DD/MM/YYYY')}</td>
                  </tr>
                  ))}
                  </tbody>
              </table>
              <hr/>
              <Form.Item>
                <Row
                  gutter={{
                    xs: 8,
                    sm: 16,
                    md: 24,
                    lg: 32,
                  }}
                >
                  <Col className="gutter-row" span={12}>
                    <Form.Item label="Ngày thanh toán">
                      <Input value={dayjs().format('DD/MM/YYYY')} readOnly/>
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={12}>
                    <Form.Item 
                      label="Tổng (VNĐ):" 
                      labelCol={{ span: 16 }}
                      wrapperCol={{ span: 8 }} 
                      labelAlign='right'
                      textAlign='right'
                    >
                      <InputNumber 
                        value={totalAmount} 
                        readOnly
                        formatter={(value) => `${Number(value).toLocaleString("vi-VN")}`} 
                        parser={(value) => value.replace(/\D/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Modal>

        </div>
    </div>
    </>
  )
}
export default FeeMange