import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spin, Alert } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import axiosInstance from '../../../api/axiosInstance';
import WebViewer from '@pdftron/webviewer';

const FilePreviewModal = ({ open, onCancel, fileId, documentId, fileName, password }) => {
  const { token } = useAuth();
  const viewerDivRef = useRef(null);
  const viewerPromise = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [downloadBlob, setDownloadBlob] = useState(null);

  useEffect(() => {
    if (!open || !ready || !viewerDivRef.current) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setDownloadBlob(null);
    const load = async () => {
      try {
        const query = new URLSearchParams({ password: password || '', withWatermark: 'true' });
        const endpoint = documentId != null
          ? `/documents/${encodeURIComponent(documentId)}/download`
          : `/documents/${encodeURIComponent(fileId)}/retrieve?${query}`;
        const response = await fetch(`${axiosInstance.defaults.baseURL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error('preview');
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        setDownloadBlob(blob);
        if (!viewerPromise.current) {
          viewerPromise.current = WebViewer(
        {
          path: '/webviewer',
          initialDoc: '',
          licenseKey: 'demo:namdotatks48@gmail.com:6184df0b0200000000d73f55b79bdee95325d2e1ea5a4f1bfe3b603ed1',
          disabledElements: [
            'ribbons',
            'toolsHeader',
            'leftPanel',
            'rightPanel',
            'menuButton',
            'viewControlsButton',
            'searchButton',
            'printButton',
            'downloadButton',
            'thumbnailsPanelButton',
            'outlinesPanelButton',
            'annotationsPanelButton',
            'bookmarksPanelButton',
            'layersPanelButton',
            'redactionButton',
            'signatureToolButton',
            'formFillToolButton',
            'stickyToolButton',
            'highlightToolButton',
            'underlineToolButton',
            'strikeoutToolButton',
            'squigglyToolButton',
            'freeTextToolButton',
            'calloutToolButton',
            'lineToolButton',
            'arrowToolButton',
            'polylineToolButton',
            'polygonToolButton',
            'cloudToolButton',
            'rectangleToolButton',
            'ellipseToolButton',
            'circleToolButton',
            'rulerToolButton',
            'protractorToolButton',
            'perimeterToolButton',
            'areaToolButton',
            'eraserToolButton',
            'cropToolButton',
            'rotateToolButton',
            'flipToolButton',
            'textSelectToolButton',
            'panToolButton',
            'zoomToolButton',
          ],
        },
            viewerDivRef.current,
          ).catch(cause => { viewerPromise.current = null; throw cause; });
        }
        const instance = await viewerPromise.current;
        if (controller.signal.aborted) return;
        await instance.Core.documentViewer.loadDocument(blob, { filename: fileName || 'document.pdf' });
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [open, ready, fileId, documentId, fileName, password, token, retry]);

  useEffect(() => () => {
    viewerPromise.current?.then(instance => instance.UI.dispose()).catch(() => {});
  }, []);

  const handleDownload = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Modal title={`Xem tệp: ${fileName || ''}`} open={open} onCancel={onCancel}
      afterOpenChange={setReady}
      footer={[
        <Button key="close" onClick={onCancel}>Đóng</Button>,
        <Button key="download" type="primary" icon={<DownloadOutlined />} disabled={!downloadBlob} onClick={handleDownload}>Tải xuống</Button>,
      ]}
      width={1100} style={{ top: 20 }} styles={{ body: { height: '75vh', position: 'relative', overflow: 'hidden' } }}>
      {error && <Alert type="error" showIcon message="Không thể xem tệp. Vui lòng kiểm tra mật khẩu hoặc thử lại."
        action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>} />}
      {loading && <div role="status" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1, background: 'rgba(255,255,255,.8)' }}><Spin tip="Đang tải nội dung tệp..." /></div>}
      <div ref={viewerDivRef} style={{ height: error ? 'calc(100% - 80px)' : '100%', width: '100%', visibility: error ? 'hidden' : 'visible' }} />
    </Modal>
  );
};

export default FilePreviewModal;
