import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Row, Col, Typography, Form, Input, Button, Divider, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthIllustration from '../../components/AuthIllustration/AuthIllustration';
import './RegisterPage.css';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        const success = await register(values);
        setLoading(false);
        if (success) {
            // Chuyển hướng đến trang thông báo đã gửi email
            navigate('/verify-email-message', { state: { email: values.email } });
        }
    };

    return (
        <div className="register-page aqua-auth-page">
            <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
                <Col xs={0} md={12} className="register-illustration-col">
                    <AuthIllustration />
                </Col>

                <Col xs={24} md={12}>
                    <div className="register-form-container">
                        <Title level={2} style={{ textAlign: 'center' }}>Đăng ký tài khoản</Title>
                        <Form
                            form={form}
                            name="register"
                            onFinish={onFinish}
                            layout="vertical"
                            requiredMark={false}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Họ và tên đệm"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Họ và tên đệm" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="Tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                                    >
                                        <Input placeholder="Tên" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            >
                                <Select placeholder="Giới tính" size="large">
                                    <Option value={true}>Nam</Option>
                                    <Option value={false}>Nữ</Option>
                                </Select>
                            </Form.Item>

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
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 kí tự.'},
                                    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;'?/.,<>]).{8,20}$/, message: 'Mật khẩu phải chứa chữ hoa, thường, số và kí tự đặc biệt.'}
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                            </Form.Item>
                             <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                    Đăng ký
                                </Button>
                            </Form.Item>
                            
                            <div style={{ textAlign: 'center' }}>
                                <Text type="secondary">Bạn đã có tài khoản? </Text>
                                <Link to="/login">Đăng nhập</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;
