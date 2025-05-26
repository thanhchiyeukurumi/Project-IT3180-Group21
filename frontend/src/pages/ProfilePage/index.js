import { useState, useEffect } from 'react';
import { Form, Input, message, DatePicker } from 'antd'
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './style.css'

export default function PersonalProfile() {
  const [data, setData] = useState({
    fullname: "",
    email: "",
    dob: "",
    contact_phone: "",
    address: ""
  });

  useEffect(() => {
    fetch("http://localhost:8386/auth/api/v1/profile", {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: "include"
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      setData(data);
    })
  }, [])

  const handleClick = () => {
    fetch("http://localhost:8386/auth/api/v1/edit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data),
      credentials: "include"
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if(data.message && data.message === "Success") {
        message.success("Cập nhật thông tin thành công");
        setData(data.profile);
      } else if (data.message)
        alert(data.message);
    })
  }

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  return (
    <>
    <div className="container">
      <div className="main-body">
        <h2>Hồ sơ cá nhân</h2>
        <div className="row gutters-sm">
          <div className="col-md-4 mb-3">
            <div className="card-profile">
              <div className="card-body">
                <div className="d-flex flex-column align-items-center text-center">
                  <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="Admin" className="rounded-circle" width="150"/>
                  <div className="mt-3">
                    <h4>Admin</h4>
                    <p>{data.fullname}</p>
                    <p>Quản trị viên</p>
                    <Link to="/password" className="btn">Đổi mật khẩu</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <Form layout='vertical'>
              <div className="card mb-3">
                <div className="card-body">
                  <Form.Item label="Họ và tên:">
                    <div className="row">
                      <Input value={data.fullname} onChange={(e) => handleChange("fullname", e.target.value)}/>
                    </div>
                  </Form.Item>
                  <hr/>
                  <Form.Item label="Email:">
                    <div className="row">
                      <Input value={data.email} onChange={(e) => handleChange("email", e.target.value)}/>
                    </div>
                  </Form.Item>
                  <hr/>
                  <Form.Item label="Ngày sinh:">
                    <div className="row">
                      <DatePicker value={dayjs(new Date(data.dob))} onChange={(date) => handleChange("dob", date.toDate())} format="DD/MM/YYYY"/>
                    </div>
                  </Form.Item>
                  <hr/>
                  <Form.Item label="Số điện thoại:">
                    <div className="row">
                      <Input value={data.contact_phone} onChange={(e) => handleChange("contact_phone", e.target.value)}/>
                    </div>
                  </Form.Item>
                  <hr/>
                  <Form.Item label="Địa chỉ:">
                    <div className="row">
                      <Input value={data.address} onChange={(e) => handleChange("address", e.target.value)}/>
                    </div>
                  </Form.Item>
                  <hr/>
                  <div className="row">
                    <div className="col-sm-12">
                      <button className="btn" onClick={handleClick}>Cập nhật</button>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
        </div>
        </div>
      </div>
    </div>
    </>
  );
}