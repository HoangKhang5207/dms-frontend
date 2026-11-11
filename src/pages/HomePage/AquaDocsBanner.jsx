import { Button } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import banner from '../../assets/aquadocs-ai-banner.png';

const AquaDocsBanner = () => {
    const { isAuthenticated } = useAuth();

    return (
        <section className="aquadocs-hero" aria-labelledby="aquadocs-title">
            <img
                className="aquadocs-banner"
                src={banner}
                width="1672"
                height="941"
                fetchPriority="high"
                alt="AquaDocs AI — nền tảng tài liệu và vận hành ngành cấp thoát nước. Minh họa hệ thống quản lý tài liệu, quy trình và trợ lý AI tại nhà máy xử lý nước."
                aria-describedby="aquadocs-description"
            />
            <div className="aquadocs-introduction">
                <div>
                    <h1 id="aquadocs-title">AquaDocs AI</h1>
                    <p id="aquadocs-description">Giải pháp quản lý tài liệu, quy trình và tri thức bằng AI cho ngành cấp thoát nước.</p>
                    <p className="aquadocs-mobile-details">
                        Quản lý tài liệu thông minh · Tự động hóa quy trình · Trợ lý AI nghiệp vụ · Báo cáo và phân tích dữ liệu.
                    </p>
                </div>
                <Button type="primary" size="large" href={isAuthenticated ? '/home' : '/login'}>Sử dụng ngay</Button>
                <a className="aquadocs-contact-link" href="/#lien-he">Liên hệ tư vấn</a>
            </div>
        </section>
    );
};

export default AquaDocsBanner;
