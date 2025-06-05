import { useState, useEffect } from "react";
import { Modal, DatePicker, Form, Input, InputNumber, Radio, Select, Row, Col } from "antd";
import "./style.css";
import moment from "moment";

function ModalEdit(props) {
    const [form] = Form.useForm();
    const { householdId, isModalEdit, onCancel, updateInfor, personInfo = {} } = props;
    
    // State này chỉ dùng để điều khiển UI (enable/disable DatePicker)
    const [isTemporary, setIsTemporary] = useState(personInfo?.status !== "Thường trú");
    const [loading, setLoading] = useState(false);

    const isOwner = personInfo?.relation_to_head ? false : true;

    useEffect(() => {
        // Cập nhật lại trạng thái isTemporary mỗi khi personInfo thay đổi
        setIsTemporary(personInfo?.status !== "Thường trú");

        if (personInfo && isModalEdit) { // Chỉ set value khi modal mở và có personInfo
            form.setFieldsValue({
                ...personInfo,
                dob: personInfo.dob ? moment(personInfo.dob) : null,
                movingIn: personInfo.movingIn ? moment(personInfo.movingIn) : null,
                endTemporary: personInfo.endTemporary ? moment(personInfo.endTemporary) : null,
            });
        } else {
            form.resetFields(); // Reset form khi đóng modal
        }
    }, [personInfo, isModalEdit, form]);

    const handleOk = async () => {
      try {
          setLoading(true);
          // values sẽ chứa tất cả các trường trong form, kể cả `numbers` và `floors`
          const values = await form.validateFields();
  
          // Dùng destructuring để tách `numbers` và `floors` ra.
          // `personData` sẽ là một object chứa TẤT CẢ các trường còn lại.
          const { numbers, floors, ...personData } = values;
  
          // Gói dữ liệu gửi đi BÂY GIỜ sẽ chỉ chứa thông tin cá nhâ
          const updatePayload = {
              ...personData, // KHÔNG còn `numbers` và `floors` ở đây nữa
              dob: values.dob ? values.dob.toISOString() : null,
              movingIn: values.movingIn ? values.movingIn.toISOString() : null,
              endTemporary: values.endTemporary ? values.endTemporary.toISOString() : null,
              householdId: householdId
          };
  
          // --- Các lệnh gọi API giữ nguyên như cũ ---
  
          const personRes = await fetch(`http://localhost:8386/person/api/v1/edit?id=${personInfo._id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatePayload) // Gửi gói dữ liệu đã được "làm sạch"
          });
          const personDataRes = await personRes.json();
          if (!personRes.ok || personDataRes.message !== "Success") {
              throw new Error(personDataRes.message || "Sửa thông tin cá nhân thất bại");
          }
  
          if (!isOwner) {
              const memberRes = await fetch(`http://localhost:8386/household/api/v1/editMember?id=${householdId}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ member_id: personInfo._id, relation_to_head: values.relation_to_head })
              });
              const memberData = await memberRes.json();
              if (!memberRes.ok || memberData.message !== "Success") {
                  throw new Error(memberData.message || "Sửa quan hệ thành viên thất bại");
              }
          }
  
          // Cập nhật lại state ở component cha với dữ liệu đúng từ form
          updateInfor({ ...personInfo, ...values }); 
          onCancel();
  
      } catch (errorInfo) {
          console.error('Failed:', errorInfo);
          Modal.error({
              title: 'Có lỗi xảy ra',
              content: errorInfo.message || 'Vui lòng kiểm tra lại thông tin.',
          });
      } finally {
          setLoading(false);
      }
  };

    const handleChangeStatus = (e) => {
        const { value } = e.target;
        if (value === "Thường trú") {
            setIsTemporary(false);
            // Khi chuyển về thường trú, xóa giá trị ngày đi
            form.setFieldsValue({ endTemporary: null });
        } else {
            setIsTemporary(true);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin"
            open={isModalEdit}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Lưu"
            cancelText="Hủy"
            width={900}
            confirmLoading={loading}
            destroyOnClose // Thêm prop này để reset state của form khi modal bị hủy
        >
            <Form
                form={form}
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 16 }}
                layout="horizontal"
                style={{ width: 800 }}
            >
                {/* ... Các Form.Item của bạn không thay đổi ... */}
                {/* Copy paste các <Row> và <Col> của bạn vào đây */}
                <Row gutter={24}>
                    <Col span={10}>
                        <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="SĐT" name="contact_phone">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item label="CCCD" name="cic">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Ngày sinh" name="dob">
                            <DatePicker format="DD-MM-YYYY" />
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item label="Giới tính" name="gender">
                            <Select>
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Nghề nghiệp" name="occupation">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item label="Quốc tịch" name="nation">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Quê quán" name="hometown">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={10}>
                        <Form.Item label="Dân tộc" name="ethnicity">
                            <Input />
                        </Form.Item>
                    </Col>
                    {isOwner && <Col span={12}>
                        <Form.Item label="Số tầng" name="floors">
                            <InputNumber disabled={true} />
                        </Form.Item>
                    </Col>}
                    {isOwner && <Col span={10}>
                        <Form.Item label="Số căn hộ" name="numbers">
                            <InputNumber disabled={true} />
                        </Form.Item>
                    </Col>}
                    <Col span={12}>
                        <Form.Item label="Trạng thái" name="status">
                            <Radio.Group onChange={handleChangeStatus}>
                                <Radio value="Thường trú">Thường trú</Radio>
                                <Radio value="Tạm trú">Tạm trú</Radio>
                                <Radio value="Tạm vắng" >Tạm vắng</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item label="Thời gian đến" name="movingIn">
                            <DatePicker format="DD-MM-YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Thời gian đi" name="endTemporary">
                            <DatePicker format="DD-MM-YYYY" disabled={!isTemporary} />
                        </Form.Item>
                    </Col>
                    {!isOwner && <Col span={10}>
                        <Form.Item label="Quan hệ" name="relation_to_head">
                            <Select>
                                <Select.Option value="Con cái">Con cái</Select.Option>
                                <Select.Option value="Vợ chồng">Vợ chồng</Select.Option>
                                <Select.Option value="Bố mẹ">Bố mẹ</Select.Option>
                                <Select.Option value="Họ hàng">Họ hàng</Select.Option>
                                <Select.Option value="Anh em">Anh em</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>}
                </Row>
            </Form>
        </Modal>
    );
}

export default ModalEdit;