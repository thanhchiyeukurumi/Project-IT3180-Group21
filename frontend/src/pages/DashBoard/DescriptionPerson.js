import React from "react";
import { Descriptions } from "antd";


function DescriptionPerson(props) {
  const {person} = props;
  return (
    <Descriptions column={3}>
        <Descriptions.Item label="Họ và tên">
          {person.name}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {person.contact_phone}
        </Descriptions.Item>
        <Descriptions.Item label="CCCD">
          {person.cic}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
        {(new Date(person.dob)).toLocaleDateString('vi-VN')}
        </Descriptions.Item>
        <Descriptions.Item label="Quốc tịch">
          {person.nation}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {person.gender}
        </Descriptions.Item>
        <Descriptions.Item label="Nghề Nghiệp">
          {person.occupation}
        </Descriptions.Item>
        <Descriptions.Item label="Quê quán">
          {person.hometown}
        </Descriptions.Item>
        <Descriptions.Item label="Dân tộc">
          {person.ethnicity}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng Thái">
          {person.status}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian đến">
        {(new Date(person.movingIn)).toLocaleDateString('vi-VN')}
        </Descriptions.Item>
        {person.endTemporary && <Descriptions.Item label="Thời gian đi">{(new Date(person.movingIn)).toLocaleDateString('vi-VN')}</Descriptions.Item>}
    </Descriptions>
  );
}

export default DescriptionPerson;
