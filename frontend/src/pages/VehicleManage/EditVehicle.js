import { Input, Form, Button, Radio, Modal, notification } from "antd";
import { useState } from "react";
import axios from "axios";

function EditVehicle({ item, onReload }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8386/vehicles/api/v2/update", {
        household_id: item.household_id,
        ownName: values.ownName,
        vehicle_type: values.vehicle_type,
        plate: values.plate,
        old_plate: item.plate
      });

      if (response.data.message === "Success") {
        openNotification("success", "Thành công", "Cập nhật phương tiện thành công!");
        setIsModalVisible(false);
        form.resetFields();
        onReload();
      } else {
        openNotification("error", "Lỗi", response.data.message || "Có lỗi xảy ra khi cập nhật phương tiện!");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error.response) {
        openNotification("error", "Lỗi", error.response.data.message || "Có lỗi xảy ra khi gửi yêu cầu!");
      } else {
        openNotification("error", "Lỗi", "Có lỗi xảy ra khi gửi yêu cầu!");
      }
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    form.setFieldsValue({
      ownName: item.ownName,
      plate: item.plate,
      vehicle_type: item.vehicle_type
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <>
      {/*<Button type="primary" onClick={showModal} style={{ marginRight: '8px' }}>
        Sửa
      </Button>*/}
      <Modal
        title="Chỉnh sửa phương tiện"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          name="edit-vehicle"
          onFinish={handleSubmit}
          initialValues={{
            ownName: item.ownName,
            plate: item.plate,
            vehicle_type: item.vehicle_type
          }}
        >
          <Form.Item
            label="Tên chủ hộ"
            name="ownName"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ hộ!" },
              { min: 2, message: "Tên chủ hộ phải có ít nhất 2 ký tự!" }
            ]}
          >
            <Input 
              placeholder="Nhập tên chủ hộ"
              style={{ width: '100%' }}
              disabled
            />
          </Form.Item>

          <Form.Item
            label="Biển số xe"
            name="plate"
            rules={[
              { required: true, message: "Vui lòng nhập biển số xe!" },
              { 
                pattern: /^[0-9A-Z\s-]+$/, 
                message: "Biển số xe chỉ được chứa chữ in hoa, số và dấu gạch ngang!" 
              },
              { 
                min: 5, 
                message: "Biển số xe phải có ít nhất 5 ký tự!" 
              }
            ]}
          >
            <Input 
              placeholder="Nhập biển số xe" 
              style={{ width: '100%' }}
              maxLength={15}
            />
          </Form.Item>

          <Form.Item
            label="Loại phương tiện"
            name="vehicle_type"
            rules={[{ required: true, message: "Vui lòng chọn loại phương tiện!" }]}
          >
            <Radio.Group>
              <Radio value="Ô tô">Ô tô</Radio>
              <Radio value="Xe máy">Xe máy</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={handleCancel} style={{ marginRight: '8px' }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default EditVehicle; 