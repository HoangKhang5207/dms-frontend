import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Row, Col, Typography, Button, Card, Form, Input, Carousel } from 'antd';
import { SearchOutlined, SaveOutlined, SolutionOutlined, TeamOutlined } from '@ant-design/icons';
import { useInView } from '../../hooks/useInView';
import './HomePage.css';

const { Title, Paragraph } = Typography;

// Component Section riêng để áp dụng hook
const AnimatedSection = ({ children, className }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section ref={ref} className={`${className} ${inView ? 'is-visible' : ''}`}>
            {children}
        </section>
    );
};

const HomePage = () => {
    // Nội dung cho các slide trong Carousel
    const carouselItems = [
        {
            title: 'Tìm kiếm tài liệu bằng ngôn ngữ tự nhiên',
            description: 'Tìm kiếm bằng ngôn ngữ tự nhiên cho phép bạn dễ dàng tìm kiếm và truy xuất thông tin từ cơ sở dữ liệu tài liệu của bạn mà không cần phải sử dụng các từ khóa cụ thể.',
            image: '/src/assets/search-illustration-1.png',
            imageAlt: 'Natural Language Search',
        },
        {
            title: 'Tìm kiếm hình ảnh bằng nội dung',
            description: 'Dễ dàng tìm thấy hình ảnh bạn cần bằng cách mô tả nội dung của chúng, hệ thống sẽ tự động phân tích và trả về kết quả chính xác.',
            image: '/src/assets/search-illustration-2.png',
            imageAlt: 'Image Content Search',
        },
        {
            title: 'Tự động trích xuất metadata cho văn bản',
            description: 'Tiết kiệm thời gian và công sức bằng cách để hệ thống tự động phân tích và trích xuất các thông tin quan trọng (metadata) từ văn bản của bạn.',
            image: '/src/assets/metadata-illustration.png',
            imageAlt: 'Metadata Extraction',
        }
    ];

    return (
        <div className="homepage-container">
            {/* Carousel Section */}
            <Carousel autoplay className="hero-carousel">
                {carouselItems.map((item, index) => (
                    <div key={index}>
                        <section className="carousel-slide">
                            <Row align="middle" gutter={48}>
                                <Col xs={24} md={12} className={index % 2 !== 0 ? 'text-col-order-2' : ''}>
                                    <Title level={2}>Hệ thống quản lý tài liệu</Title>
                                    <Title level={3} className="highlight-title">{item.title}</Title>
                                    <Paragraph>{item.description}</Paragraph>
                                    <Button type="primary" size="large" icon={<SearchOutlined />}>
                                        Sử dụng ngay
                                    </Button>
                                </Col>
                                <Col xs={24} md={12} className={index % 2 !== 0 ? 'image-col-order-1' : ''}>
                                    <img src={item.image} alt={item.imageAlt} style={{ maxWidth: '100%' }} />
                                </Col>
                            </Row>
                        </section>
                    </div>
                ))}
            </Carousel>

            {/* Section 4: Tính năng chính */}
            <AnimatedSection id="tinh-nang" className="main-features-section fade-in-up">
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
            </AnimatedSection>
            
            {/* Section 5: Liên hệ */}
            <AnimatedSection id="lien-he" className="contact-section fade-in-up">
                {/* ... (phần này giữ nguyên như đã cập nhật) ... */}
                <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Liên hệ</Title>
                <Paragraph style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
                    Chúng tôi rất mong nhận được phản hồi từ bạn. Hãy liên hệ với chúng tôi qua biểu mẫu bên dưới hoặc qua các phương thức liên lạc khác.
                </Paragraph>
                <Row gutter={[48, 48]} align="middle">
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
                            <img
                                src="/src/assets/contact-illustration.png"
                                alt="IMT Solutions"
                                className="contact-image"
                            />
                        </div>
                    </Col>
                </Row>
            </AnimatedSection>
        </div>
    );
};

export default HomePage;