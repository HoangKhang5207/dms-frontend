import banner from '../../assets/aquadocs-ai-banner.png';

const AuthIllustration = () => (
    <aside className="aquadocs-auth-artwork">
        <span className="aquadocs-eyebrow">AQUADOCS AI</span>
        <h2>Tài liệu, quy trình và tri thức<br />trong một nền tảng.</h2>
        <p>Giải pháp quản lý tài liệu cho ngành cấp thoát nước.</p>
        <img src={banner} width="1672" height="941" alt="" />
        <p className="aquadocs-auth-caption">Đồng hành cùng ngành nước hiện đại</p>
    </aside>
);

export default AuthIllustration;
