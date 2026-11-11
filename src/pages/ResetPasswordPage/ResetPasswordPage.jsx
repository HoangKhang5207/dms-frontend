import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Typography, Form, Input, Button, Result, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './ResetPasswordPage.css';

const { Title, Paragraph } = Typography;

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();
    
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('form'); // 'form', 'success', 'error'
    const [form] = Form.useForm();

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (!resetToken) {
            setStatus('error');
        } else {
            setToken(resetToken);
        }
    }, [searchParams]);

    const onFinish = async (values) => {
        setLoading(true);
        const success = await resetPassword(token, values.newPassword);
        setLoading(false);
        if (success) {
            setStatus('success');
        }
    };

    // --- Render theo từng trạng thái ---

    if (status === 'error') {
        return (
            <div className="reset-password-page aqua-auth-page">
                 <Result
                    status="error"
                    title="Đường dẫn không hợp lệ"
                    subTitle="Đường dẫn đặt lại mật khẩu không đúng hoặc đã hết hạn. Vui lòng thử lại."
                    extra={<Button type="primary" onClick={() => navigate('/forgot-password')}>Yêu cầu lại</Button>}
                />
            </div>
        );
    }

    if (status === 'success') {
         return (
            <div className="reset-password-page aqua-auth-page">
                <Result
                    status="success"
                    title="Đặt Lại Mật Khẩu Thành Công!"
                    subTitle="Mật khẩu của bạn đã được thay đổi. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới."
                    extra={<Button type="primary" onClick={() => navigate('/login')}>Đi đến trang Đăng nhập</Button>}
                />
            </div>
        );
    }
    
    // Mặc định hiển thị form
    return (
        <div className="reset-password-page aqua-auth-page">
            <Row justify="center" style={{ minHeight: '100vh' }}>
                 <Col xs={22} sm={20} md={12} lg={10} xl={8}>
                     <div className="reset-password-form-container">
                        <Title level={2} style={{ textAlign: 'center' }}>Tạo mật khẩu mới</Title>
                        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
                            Mật khẩu mới của bạn phải khác với mật khẩu đã sử dụng trước đây.
                        </Paragraph>
                        <Form form={form} name="reset_password" onFinish={onFinish} layout="vertical">
                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 kí tự.' },
                                    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;'?/.,<>]).{8,20}$/, message: 'Mật khẩu phải chứa chữ hoa, thường, số và kí tự đặc biệt.' }
                                ]}
                                hasFeedback
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" />
                            </Form.Item>
                             <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu mới"
                                dependencies={['newPassword']}
                                hasFeedback
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
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
                                    Đặt lại mật khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                 </Col>
            </Row>
        </div>
    );
};

export default ResetPasswordPage;