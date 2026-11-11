import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Form, Input, Button, Select, Space, Alert, List, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useOrganization } from '../../../../contexts/OrganizationContext';

const { Option } = Select;
const { Text } = Typography;

const InviteMembersModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const { organization, departments, inviteMembers } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // State để lưu kết quả sau khi mời

    const handleFinish = async (values) => {
        setLoading(true);
        const res = await inviteMembers(organization.id, values.users);
        if (res.success) {
            setResult(res.data);
            form.resetFields();
        }
        setLoading(false);
    };

    const handleClose = () => {
        setResult(null); // Reset kết quả khi đóng modal
        onCancel();
    };

    return (
        <Modal
            title="Mời thành viên mới"
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
        >
            {result ? (
                // Giao diện hiển thị kết quả
                <div>
                    <Alert message="Hoàn tất gửi lời mời!" type="success" showIcon style={{ marginBottom: 16 }} />
                    {result.successfully_invited_emails.length > 0 && (
                        <List
                            header={<Text strong>Các lời mời đã được gửi thành công đến:</Text>}
                            dataSource={result.successfully_invited_emails}
                            renderItem={item => <List.Item>{item}</List.Item>}
                        />
                    )}
                    {result.already_in_org_emails.length > 0 && (
                        <List
                            header={<Text strong style={{ color: '#faad14' }}>Các email sau đã thuộc một tổ chức khác:</Text>}
                            dataSource={result.already_in_org_emails}
                            renderItem={item => <List.Item>{item}</List.Item>}
                            style={{ marginTop: 16 }}
                        />
                    )}
                    <Button type="primary" onClick={handleClose} style={{ marginTop: 24, float: 'right' }}>
                        Đóng
                    </Button>
                </div>
            ) : (
                // Form mời thành viên
                <Form form={form} onFinish={handleFinish} autoComplete="off">
                    <Form.List name="users">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} className="aqua-invite-row" style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'email']}
                                            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                                        >
                                            <Input aria-label="Email thành viên" placeholder="Email thành viên" style={{ width: 250 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'department_id']}
                                            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
                                        >
                                            <Select aria-label="Phòng ban thành viên" placeholder="Chọn phòng ban" style={{ width: 200 }}>
                                                {departments.map(dept => (
                                                    <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Button type="text" icon={<MinusCircleOutlined />} aria-label="Xóa dòng thành viên" onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm thành viên
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Button onClick={handleClose} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Gửi lời mời
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default InviteMembersModal;
