import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Row, Col, Typography, Form, Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthIllustration from '../../components/AuthIllustration/AuthIllustration';
import './LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        const success = await login(values.email, values.password);
        setLoading(false);
        if (success) {
            navigate('/home'); // Chuyển hướng đến /home khi thành công
        }
    };

    return (
        <div className="login-page aqua-auth-page">
            <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
                <Col xs={0} md={12} className="login-illustration-col">
                    <AuthIllustration />
                </Col>

                <Col xs={24} md={12}>
                    <div className="login-form-container">
                        <Title level={2} style={{ textAlign: 'center' }}>Đăng nhập</Title>
                        <Form
                            form={form}
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            requiredMark={false}
                        >
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                    Đăng nhập
                                </Button>
                            </Form.Item>

                            <Divider><Text type="secondary">hoặc</Text></Divider>

                            <Form.Item>
                                <Button icon={<GoogleOutlined />} block size="large">
                                    Đăng nhập bằng Google
                                </Button>
                            </Form.Item>

                            <div style={{ textAlign: 'center' }}>
                                <Text type="secondary">Bạn chưa có tài khoản? </Text>
                                <Link to="/register">Tạo tài khoản</Link>
                                <br />
                                <Link to="/forgot-password">Quên mật khẩu?</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;
