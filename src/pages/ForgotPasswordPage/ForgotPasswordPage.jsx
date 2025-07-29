import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Row, Col, Typography, Form, Input, Button, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ForgotPasswordPage.css';

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordPage = () => {
    const { requestPasswordReset } = useAuth();
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false); // State để chuyển đổi UI
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        await requestPasswordReset(values.email);
        setLoading(false);
        setRequestSent(true); // Luôn hiển thị thông báo thành công
    };

    // UI hiển thị sau khi gửi yêu cầu
    if (requestSent) {
        return (
            <div className="forgot-password-page">
                <Result
                    status="success"
                    title="Yêu Cầu Đã Được Gửi!"
                    subTitle="Nếu email bạn cung cấp tồn tại trong hệ thống, chúng tôi đã gửi một liên kết để đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn."
                    extra={[
                        <Button type="primary" key="login" onClick={() => navigate('/login')}>
                            Về trang Đăng nhập
                        </Button>,
                    ]}
                />
            </div>
        );
    }
    
    // UI form ban đầu
    return (
        <div className="forgot-password-page">
            <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
                <Col xs={0} md={12} className="forgot-password-illustration-col">
                    <img
                        src="/src/assets/metadata-illustration.png" // Sử dụng hình ảnh khác
                        alt="Forgot Password Illustration"
                        className="forgot-password-illustration-img"
                    />
                </Col>

                <Col xs={24} md={12}>
                    <div className="forgot-password-form-container">
                        <Title level={2} style={{ textAlign: 'center' }}>Đặt lại mật khẩu</Title>
                        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
                            Đường dẫn đặt lại mật khẩu sẽ được gửi về email của bạn.
                        </Paragraph>
                        <Form
                            name="forgot_password"
                            onFinish={onFinish}
                            layout="vertical"
                        >
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" size="large" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                    Gửi yêu cầu
                                </Button>
                            </Form.Item>
                            
                            <div style={{ textAlign: 'center' }}>
                                <Link to="/login">Quay lại Đăng nhập</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ForgotPasswordPage;