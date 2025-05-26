import { Input, Form, Button, InputNumber, Select, DatePicker, notification, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import axios from "axios";

function EditFee(props) {
  const { item, onReload } = props;
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);

  const [householdsOptions, setHouseholdsOptions] = useState([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);

  //Modal cập nhật
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Hàm mở Modal
  const showModal = (item) => {
    setIsModalVisible(true);
    setFee(item);
    //console.log(item);
  };

  // Hàm đóng Modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        const response = await axios.get("http://localhost:8386/household/api/v1/all");
        const options = response.data.array.map((household) => ({
          household_id:household.id,
          value: household.numbers[0],
          label: `Hộ ${household.head}`,
        }));
        setHouseholdsOptions(options);
        setLoadingHouseholds(false);
      } catch (error) {
        console.error("Error fetching household options:", error);
        setLoadingHouseholds(false);
      }
    };

    fetchHouseholds();
  }, []);

  const [isMandatory, setIsMandatory] = useState(true);
  const handleStatusChange = (value) => {
    setIsMandatory(value === "required");
  };

  const [checkedList, setCheckedList] = useState([]);
  const handleChange = (list) => {
    setCheckedList(list);
  };

  const sharedProps = {
    mode: "multiple",
    style: {
      width: "100%",
    },
    placeholder: "Chọn hộ gia đình...",
    maxTagCount: "responsive",
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 2,
      pauseOnHover: true,
    });
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {};
      if (values.id) {
        payload.id = values.id;
      } else {
        openNotification("error", "Lỗi", "ID thiếu hoặc không hợp lệ!");
        return;
      }
      if (values.name) {
        payload.name = values.name;
      }
      if (values.amount !== undefined) {
        payload.amount = values.amount;
      }
      if (values.due) {
        payload.due = values.due;
      }
      if (values.status) {
        payload.status = values.status === "required" ? "Bắt buộc" : "Không bắt buộc";
      }
      if(values.households) {
        payload.households = values.status === "required" ? "Tất cả" : values.households;
      }

      const response = await axios.post("http://localhost:8386/fees/api/v1/change", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      onReload();

      if (response.status === 200) {
        openNotification("success", "Thành công", "Cập nhật thành công!");
        setTimeout(() => {
          navigate("/fee_list");
        }, 2000);
        setIsModalVisible(false);
      } else {
        openNotification("error", "Thất bại", "Cập nhật thất bại!");
      }
    } catch (error) {
      openNotification("error", "Lỗi", "Có lỗi xảy ra khi gửi yêu cầu !!!");
    }
  };

  const { Option } = Select;

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };

  return (
    <>
      <button className="btn-details" onClick={() => showModal(item)}>Cập nhật</button>
      <Modal
        title="Chỉnh sửa thông tin"
        open={isModalVisible}
        //onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          {...formItemLayout}
          layout="horizontal"
          name="create-fee"
          onFinish={handleSubmit}
          initialValues={{
            id: fee ? fee._id : undefined,
            STT: undefined,
            name: fee ? fee.name : "",
            amount: fee ? fee.amount : undefined,
            due: fee ? fee.due : undefined,
            status: fee ? fee.status : undefined,
          }}
        >
          <Form.Item name="id" style={{ display: "none" }}>
            <Input />
          </Form.Item>
          <Form.Item label="Tên loại phí" name="name" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Giá/đơn vị" name="amount" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <InputNumber 
              formatter={(value) => `${Number(value).toLocaleString("vi-VN")}`} 
              parser={(value) => value.replace(/\D/g, '')}
              style={{ width: "auto", maxWidth: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Thời hạn (tháng)" name="due" rules={[{ required: true, message: "Bắt buộc!" }]}>
            <InputNumber />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
            <Select placeholder="Chọn trạng thái" onChange={handleStatusChange}>
              <Option value="required">Bắt buộc</Option>
              <Option value="unrequired">Không bắt buộc</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Hộ gia đình"
            name="households"
            rules={!isMandatory ? [{ required: true }] : []}
          >
            {loadingHouseholds ? (
              <p>Đang tải danh sách hộ gia đình...</p>
            ) : (
              <Select
                {...sharedProps}
                placeholder={isMandatory ? "Tất cả hộ gia đình" : "Chọn hộ gia đình"}
                disabled={isMandatory}
                value={checkedList}
                onChange={handleChange}
              >
                {householdsOptions.map((option) => (
                  <Select.Option key={option.value} value={option.household_id}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" onClick={showModal}>
              {fee ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default EditFee;
