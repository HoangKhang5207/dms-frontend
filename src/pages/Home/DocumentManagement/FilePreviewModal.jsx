import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Spin, Button } from 'antd';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const FilePreviewModal = ({ file, onCancel }) => {
    if (!file) return null;

    // Tạo cấu trúc documents mà react-doc-viewer yêu cầu
    const docs = [
        { uri: file.url, fileName: file.name },
    ];

    // Cấu hình để hiển thị header gọn gàng hơn
    const viewerConfig = {
        header: {
            disableHeader: false,
            disableFileName: true,
            retainURLParams: false
        }
    };

    return (
        <Modal
            open={!!file}
            onCancel={onCancel}
            footer={null}
            title={`Xem trước: ${file.name}`}
            width="90vw"
            style={{ top: 20 }}
            destroyOnClose
            // Cho phép modal chiếm toàn bộ chiều cao
            bodyStyle={{ height: '85vh', overflow: 'hidden', padding: 0 }}
        >
            <DocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
                config={viewerConfig}
                // Hiển thị loading spinner trong khi thư viện đang render file
                preRender={(
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" tip="Đang chuẩn bị bản xem trước..." />
                    </div>
                )}
                // Giao diện khi không thể render file
                noRenderer={(
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <p>Rất tiếc, không thể xem trước loại tệp này.</p>
                        <Button type="primary" href={file.url} target="_blank" download>
                            Tải xuống {file.name}
                        </Button>
                    </div>
                )}
            />
        </Modal>
    );
};

export default FilePreviewModal;