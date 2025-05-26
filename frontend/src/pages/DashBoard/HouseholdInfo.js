import { useState, useEffect } from 'react';  
import { Card, Descriptions, Table ,Button, Modal, message} from "antd";
import { EditOutlined , ExclamationCircleOutlined } from '@ant-design/icons';
import { Space , Tag} from 'antd';
import DescriptionPerson from './DescriptionPerson';
import "./style.css"
import ModalEdit from './ModalEdit';
import { useSearchParams } from 'react-router-dom';


const HouseholdInfo = () => {
  const [isModalEdit, setModalEdit] = useState(false)
  const [searchParams] = useSearchParams();
  const householdId = searchParams.get("household_id");
  const [data, setData] = useState(null);
  const [editedOwnerInfo, setEditedOwnerInfo] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const top = "none";
  const bottom = "bottomRight";
  const [appearDelete, setAppearDelete] = useState(false);
  const [isDeleted,setIsDeleted] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8386/household/api/v1/detail?householdId=${householdId}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    })
    .then((res) => {
      return res.json();
    })
    .then(res => {
      if(res.message === "Success") {
        console.log('household', res);
        const household = res.household;
        setData(household.members.map(member => handleMember(member)));
        setEditedOwnerInfo({...household.head, floors: (household.apartments.number / 100).toFixed(0), numbers: household.apartments.number });
      }
      else if(res.message)
        alert(res.message);
    })
    .catch(error => {
      console.log(error);
    });
  }, [householdId, isDeleted]);

  const handleMember = (member) => {
    return {
      key: member._id,
      name: member.name,
      dob: (new Date(member.dob)).toLocaleDateString('vi-VN'),
      relation_to_head: member.relation_to_head,
      contact_phone: member.contact_phone,
      status: member.status,
      description: member
    };
  }


  /*=========================Xử lí bảng thông tin người ở trong căn hộ =======================>*/
     
  const tableColumns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
    },
    {
      title: "Quan hệ",
      dataIndex: "relation_to_head",
      filters: [],
    },
    {
      title: "Số điện thoại",
      dataIndex: "contact_phone",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      render: (status) => {
        let color = status === "Thường trú" ? "green" : status === "Tạm trú" ? "yellow" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Mở rộng",
      key: "action",
      render: (record) => (
        <Space size="middle">
          <Button color="default" icon={<EditOutlined />} onClick={() => {
            setSelectedPerson(record.key);
          }} />
        </Space>
      ),
    },
  ];

  const updateResidentInfo = (updatedInfo) => {
    const value = handleMember(updatedInfo);
    setData(prev => {
      const index = prev.findIndex((item) => item.key === value.key);
      const updatedData = [...prev];
      updatedData[index] = value;
      return updatedData;
    });
  };

   // xử lí xóa
  useEffect(()=>{
      if(isDeleted) {
        setData(prev => prev.filter((item) => !selectedRows.includes(item)));
        setIsDeleted(false);
        setAppearDelete(false);
      }
  },[selectedRows,isDeleted]);

  const handleRowSelectionChange = (keys,rows) => {
      setAppearDelete(keys.length === 0 ? false: true);
      setSelectedRows(rows);
  }; 
  const handleDelete = () => {
    fetch(`http://localhost:8386/household/api/v1/deleteMem?id=${householdId}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ selectedRows })
    })
    .then((res) => {
      return res.json();
    })
    .then(res => {
      if(res.status === 200) {
        setIsDeleted(true);
        window.location.reload();
      }
      else if(res.message)
        alert(res.message);
    })
  };

  const handleConfirm = () => {
      Modal.confirm({
          title : "Confirm",
          icon : <ExclamationCircleOutlined />,
          content: "Xác nhận xóa?",
          okText:"Xác nhận",
          cancelText:"Hủy",
          centered: true,
          onOk: handleDelete,
      });
  };

  const tableProps = {
    rowSelection: {
      onChange: handleRowSelectionChange,
    }
  };
  const handleCancelModal2 = () => {
    setSelectedPerson(null); 
  };
  const handleCancelModal1 = () => {
    setModalEdit(false);
  };
  if (!data) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
   <> 
    <div className='description-container'>
      {/* Thông tin chủ hộ */}
      <Card
        title="Thông tin chủ hộ"
        bordered={false}
        style={{ marginBottom: 24 }}
        extra={<Button type="primary" onClick={() => {setModalEdit(true);
        }}>Sửa</Button>}
      >
        <Descriptions column={3}>
          <Descriptions.Item label="Họ và tên">
            {editedOwnerInfo?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Số tầng">
            {editedOwnerInfo?.floors}
          </Descriptions.Item>
          <Descriptions.Item label="Số căn hộ">
            {editedOwnerInfo?.numbers}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {editedOwnerInfo?.contact_phone}
          </Descriptions.Item>
          <Descriptions.Item label="CCCD">
            {editedOwnerInfo?.cic}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {(new Date(editedOwnerInfo?.dob)).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Quốc tịch">
            {editedOwnerInfo?.nation}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {editedOwnerInfo?.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Nghề Nghiệp">
            {editedOwnerInfo?.occupation}
          </Descriptions.Item>
          <Descriptions.Item label="Quê quán">
            {editedOwnerInfo?.hometown}
          </Descriptions.Item>
          <Descriptions.Item label="Dân tộc">
            {editedOwnerInfo?.ethnicity}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái">
            {editedOwnerInfo?.status}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian đến">
            {(new Date(editedOwnerInfo?.movingIn)).toLocaleDateString('vi-VN') }
          </Descriptions.Item>
          {editedOwnerInfo?.endTemporary && <Descriptions.Item label="Thời gian đi">{(new Date(editedOwnerInfo?.endTemporary)).toLocaleDateString('vi-VN')}</Descriptions.Item>}
        </Descriptions>
      </Card>
      
      {/* Modal sửa thông tin cá nhân */}
      <ModalEdit householdId={householdId} isModalEdit={isModalEdit} personInfo={editedOwnerInfo} updateInfor={setEditedOwnerInfo} onCancel={handleCancelModal1}/>
      {data.map((item) => (<ModalEdit householdId={householdId} isModalEdit={selectedPerson === item.key} personInfo={item.description} updateInfor={updateResidentInfo} onCancel={handleCancelModal2}/>))}

      {/* Danh sách người ở trong căn hộ */}
      <Card title="Danh sách người ở trong căn hộ" bordered={false} extra= {appearDelete? <Button onClick={handleConfirm} color="danger" variant="filled">Xóa</Button> : null}>
      <Table
        {...tableProps}
        pagination={{
          position: [top, bottom],
        }}
        expandable={{
          expandedRowRender: (record) => <DescriptionPerson person={record.description} />,
        }}   
        columns={tableColumns}
        dataSource={data}
      />
      </Card>
    </div>
  </>
  );
};

export default HouseholdInfo;
