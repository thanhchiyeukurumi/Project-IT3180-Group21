import "./style.css";
import { Link, useNavigate } from 'react-router-dom';
import { CloseOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, notification } from "antd";
import EditFee from "./EditFee";
import CreateFee from "./CreateFee";

const openNotification = (type, message, description) => {
  notification[type]({
    message,
    description,
    placement: "topRight",
    duration: 2,
    pauseOnHover: true,
  });
};

function FeeList() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  const handleReload = () => {
    setReload(!reload);
  }

  const fetchFees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8386/fees/api/v1/fees");
      setFees(response.data.array);
    } catch (error) {
      console.error("Error fetching fees data:", error);
      openNotification("error", "Lỗi", "Có lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Hiển thị modal xác nhận trước khi xóa
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa loại phí này không?",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            const response = await axios.post(
              "http://localhost:8386/fees/api/v1/delete",
              { id },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.status === 200 || response.status === 201) {
              openNotification("success", "Thành công", "Xóa thành công!");
              await fetchFees();
            } else {
              openNotification("error", "Thất bại", "Xóa thất bại!");
            }
          } catch (error) {
            openNotification("error", "Lỗi", "Có lỗi xảy ra khi xóa!");
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      openNotification("error", "Lỗi", "Error in delete handler!");
    }
  };

  useEffect(() => {
    fetchFees();
  }, [reload]);

  return (
    <>
      <div className="details__fee">
        <div className="recentCt">
          <div className="cardHeader">
            <h2>Danh sách các loại phí</h2>
            <div className="all-button">
              <CreateFee onReload={handleReload}/>
              {/* <Link to="/fee_create" className="btn">Thêm loại phí</Link> */}
              <Link to="/fee_manage" className="btn">Quay lại</Link>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <td>STT</td>
                <td>Loại phí</td>
                <td>Giá/đơn vị</td>
                <td>Thời hạn</td>
                <td>Bắt buộc</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, index) => {
                return (
                  <tr key={index + 1}>
                    <td>{index + 1}</td>
                    <td>{fee.name}</td>
                    <td>{fee.amount.toLocaleString("vi-VN")} VNĐ</td>
                    <td>{fee.due} Tháng</td>
                    <td>{fee.status}</td>
                    <td>{fee.count}</td>
                    <td style={{maxWidth: '80px'}}>
                      <EditFee item={fee} onReload={handleReload}/>
                      <button className="btn-details delete-icon" onClick={() => handleDelete(fee._id)}><CloseOutlined /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default FeeList;