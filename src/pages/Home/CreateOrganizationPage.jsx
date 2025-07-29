import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Form, Input, Button, Checkbox, Switch, Typography, Modal, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../../contexts/OrganizationContext';
import './CreateOrganizationPage.css';

const { Title, Link: AntLink } = Typography;

const TermsAndConditions = ({ visible, onOk, onCancel }) => (
    <Modal
        title="Điều khoản & quy định của Genadata"
        open={visible}
        onOk={onOk}
        onCancel={onCancel}
        width={800}
        footer={[
            <Button key="accept" type="primary" onClick={onOk}>
                Đồng ý
            </Button>,
        ]}
    >
        {/* Nội dung điều khoản có thể được load từ một nguồn khác */}
        <p><strong>Mục đích:</strong> Dịch vụ lưu trữ và tìm kiếm tài liệu thông minh...</p>
        <p><strong>Tài liệu Được Phép:</strong> Tài liệu thuộc quyền sở hữu hợp pháp...</p>
        <p><strong>Tài liệu Không Được Phép:</strong> Tài liệu vi phạm bản quyền...</p>
    </Modal>
);

const CreateOrganizationPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { createOrganization } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        await createOrganization(values);
        setLoading(false);
    };

    const handleAcceptTerms = () => {
        setTermsAccepted(true);
        form.setFieldsValue({ terms: true });
        setIsModalVisible(false);
    };

    return (
        <div className="create-org-page-container">
            <Spin spinning={loading}>
                <div className="create-org-form-wrapper">
                    <Title level={3} style={{ marginBottom: '24px', textAlign: 'center' }}>
                        Yêu cầu tạo tổ chức
                    </Title>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="name"
                            label="Tên tổ chức"
                            rules={[{ required: true, message: 'Vui lòng nhập tên tổ chức!' }]}
                        >
                            <Input placeholder="Ví dụ: Công ty TNHH Genifast" />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Mô tả"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Mô tả ngắn về tổ chức của bạn" />
                        </Form.Item>
                        <Form.Item name="isOpenai" label="Sử dụng tích hợp OpenAI" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            name="terms"
                            valuePropName="checked"
                            rules={[{
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với điều khoản!')),
                            }]}
                        >
                            <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
                                Tôi đã đọc và đồng ý với <AntLink onClick={() => setIsModalVisible(true)}>Điều khoản</AntLink>
                            </Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block disabled={!termsAccepted}>
                                Gửi Yêu cầu
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
            <TermsAndConditions
                visible={isModalVisible}
                onOk={handleAcceptTerms}
                onCancel={() => setIsModalVisible(false)}
            />
        </div>
    );
};

export default CreateOrganizationPage;