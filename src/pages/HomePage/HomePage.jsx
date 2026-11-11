import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Row, Col, Typography, Button, Card, Form, Input } from 'antd';
import { SaveOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import AquaDocsBanner from './AquaDocsBanner';
import './HomePage.css';

const { Title, Paragraph } = Typography;

const PageSection = ({ children, className, id }) => (
    <section id={id} className={className}>{children}</section>
);

const HomePage = () => {
    const { hash, key } = useLocation();

    useEffect(() => {
        if (!hash) return;

        let cancelled = false;
        document.fonts.ready.then(() => {
            if (!cancelled) {
                document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        });

        return () => { cancelled = true; };
    }, [hash, key]);

    return (
        <div className="homepage-container">
            <AquaDocsBanner />

            {/* Section 4: Tính năng chính */}
            <PageSection id="tinh-nang" className="main-features-section">
                {/* ... (phần này giữ nguyên như trước) ... */}
                <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Tính năng chính</Title>
                <Paragraph style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
                    Hệ thống của chúng tôi cung cấp một loạt các tính năng mạnh mẽ để hỗ trợ quản lý tài liệu cho tổ chức của bạn.
                </Paragraph>
                <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} sm={12} md={8}>
                        <Card className="feature-card" hoverable>
                            <SaveOutlined className="feature-icon" />
                            <Title level={4}>Lưu trữ</Title>
                            <Paragraph>Dễ dàng lưu trữ và quản lý tài liệu, cho phép truy xuất thông tin một cách nhanh chóng và hiệu quả.</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="feature-card" hoverable>
                            <SolutionOutlined className="feature-icon" />
                            <Title level={4}>Tìm kiếm</Title>
                            <Paragraph>Tìm kiếm tài liệu bằng ngôn ngữ tự nhiên, trích xuất metadata, tìm kiếm bằng metadata và tìm kiếm nội dung hình ảnh một cách hiệu quả.</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="feature-card" hoverable>
                            <TeamOutlined className="feature-icon" />
                            <Title level={4}>Tổ chức</Title>
                            <Paragraph>Lưu trữ và quản lý tài liệu theo phòng ban, giúp tổ chức dữ liệu một cách khoa học và dễ dàng truy cập.</Paragraph>
                        </Card>
                    </Col>
                </Row>
            </PageSection>
            
            {/* Section 5: Liên hệ */}
            <PageSection id="lien-he" className="contact-section">
                {/* ... (phần này giữ nguyên như đã cập nhật) ... */}
                <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Liên hệ</Title>
                <Paragraph style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
                    Chúng tôi rất mong nhận được phản hồi từ bạn. Hãy liên hệ với chúng tôi qua biểu mẫu bên dưới hoặc qua các phương thức liên lạc khác.
                </Paragraph>
                <Row gutter={[{ xs: 24, md: 48 }, 48]} align="middle">
                    <Col xs={24} md={12}>
                        <Form layout="vertical">
                            <Form.Item label="Tên của bạn" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                                <Input placeholder="Nhập tên của bạn" />
                            </Form.Item>
                            <Form.Item label="Email liên hệ" name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
                                <Input placeholder="Nhập email của bạn" />
                            </Form.Item>
                            <Form.Item label="Tin nhắn" name="message" rules={[{ required: true, message: 'Vui lòng nhập tin nhắn!' }]}>
                                <Input.TextArea rows={4} placeholder="Nhập tin nhắn" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">Gửi</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="contact-info-card">
                            <Title level={4}>Thông tin liên hệ</Title>
                            <Paragraph><strong>Địa chỉ:</strong> Pitech lab 24 Hoàng Quốc Việt, nhà số 25 (Tòa nhà RECON), phòng 502.</Paragraph>
                            <Paragraph>Trung tâm đào tạo lập trình viên và kỹ sư AI thực chiến đỉnh cao.</Paragraph>
                            <Paragraph><strong>Email:</strong> imt.pitech@gmail.com</Paragraph>
                            <Paragraph><strong>Điện thoại:</strong> 0904140022</Paragraph>
                        </div>
                    </Col>
                </Row>
            </PageSection>
        </div>
    );
};

export default HomePage;
