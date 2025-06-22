import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { Button, Card, Descriptions, Table, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';

function HouseholdInfo() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const householdId = searchParams.get('household_id');
    const householdData = location.state?.householdData;
    
    const [members, setMembers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        // Fetch household members
        const fetchMembers = async () => {
            try {
                const response = await fetch(`http://localhost:8386/person/api/v1/by-household/${householdId}`, {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                });
                const data = await response.json();
                setMembers(data.array || []);
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        if (householdId) {
            fetchMembers();
        }
    }, [householdId]);

    const handleAddMember = async (values) => {
        try {
            const memberData = {
                ...values,
                household_id: householdId,
                floors: householdData?.floors || [],
                numbers: householdData?.numbers || [],
                birth_date: values.birth_date?.format('YYYY-MM-DD'),
            };

            const response = await fetch('http://localhost:8386/person/api/v1/create', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(memberData),
            });

            const result = await response.json();
            
            if (result.success) {
                message.success('Thêm thành viên thành công!');
                setIsModalVisible(false);
                form.resetFields();
                
                // Refresh members list
                const updatedResponse = await fetch(`http://localhost:8386/person/api/v1/by-household/${householdId}`, {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                });
                const updatedData = await updatedResponse.json();
                setMembers(updatedData.array || []);
            } else {
                message.error('Có lỗi xảy ra khi thêm thành viên');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            message.error('Có lỗi xảy ra khi thêm thành viên');
        }
    };

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'CCCD/CMND',
            dataIndex: 'citizen_id',
            key: 'citizen_id',
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'birth_date',
            key: 'birth_date',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'Quan hệ với chủ hộ',
            dataIndex: 'relationship',
            key: 'relationship',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Card title="Thông tin hộ gia đình" style={{ marginBottom: '20px' }}>
                <Descriptions column={2}>
                    <Descriptions.Item label="Chủ hộ">{householdData?.head}</Descriptions.Item>
                    <Descriptions.Item label="Liên hệ">{householdData?.contact}</Descriptions.Item>
                    <Descriptions.Item label="Tầng">{householdData?.floors?.join(', ')}</Descriptions.Item>
                    <Descriptions.Item label="Số căn hộ">{householdData?.numbers?.join(', ')}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card 
                title="Danh sách thành viên"
                extra={
                    <Button 
                        type="primary" 
                        icon={<UserAddOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        Thêm thành viên
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={members}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Thêm thành viên mới"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddMember}
                >
                    <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        name="citizen_id"
                        label="CCCD/CMND"
                        rules={[{ required: true, message: 'Vui lòng nhập CCCD/CMND!' }]}
                    >
                        <Input placeholder="Nhập CCCD/CMND" />
                    </Form.Item>

                    <Form.Item
                        name="birth_date"
                        label="Ngày sinh"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                    >
                        <DatePicker 
                            style={{ width: '100%' }}
                            placeholder="Chọn ngày sinh"
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="Giới tính"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                    >
                        <Select placeholder="Chọn giới tính">
                            <Select.Option value="Nam">Nam</Select.Option>
                            <Select.Option value="Nữ">Nữ</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="relationship"
                        label="Quan hệ với chủ hộ"
                        rules={[{ required: true, message: 'Vui lòng nhập quan hệ!' }]}
                    >
                        <Select placeholder="Chọn quan hệ">
                            <Select.Option value="Chủ hộ">Chủ hộ</Select.Option>
                            <Select.Option value="Vợ/Chồng">Vợ/Chồng</Select.Option>
                            <Select.Option value="Con">Con</Select.Option>
                            <Select.Option value="Cha/Mẹ">Cha/Mẹ</Select.Option>
                            <Select.Option value="Anh/Chị/Em">Anh/Chị/Em</Select.Option>
                            <Select.Option value="Khác">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="contact_phone"
                        label="Số điện thoại"
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        initialValue="Thường trú"
                    >
                        <Select>
                            <Select.Option value="Thường trú">Thường trú</Select.Option>
                            <Select.Option value="Tạm trú">Tạm trú</Select.Option>
                            <Select.Option value="Tạm vắng">Tạm vắng</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <div style={{ textAlign: 'right' }}>
                            <Button 
                                onClick={() => {
                                    setIsModalVisible(false);
                                    form.resetFields();
                                }}
                                style={{ marginRight: 8 }}
                            >
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Thêm thành viên
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default HouseholdInfo;
