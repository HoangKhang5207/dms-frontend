import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Space, message } from "antd";

const PublicViewer = () => {
  const { token } = useParams();
  const [blobUrl, setBlobUrl] = useState(null);
  const [filename, setFilename] = useState("document");
  const [contentType, setContentType] = useState("application/octet-stream");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/public/documents/share/${token}`);
      if (!res.ok) {
        message.error("Không thể tải tài liệu công khai");
        setLoading(false);
        return;
      }
      const cd = res.headers.get("Content-Disposition");
      if (cd && cd.includes("filename=")) {
        setFilename(cd.split("filename=")[1].replace(/"/g, ""));
      }
      const ct = res.headers.get("Content-Type");
      if (ct) setContentType(ct);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải tài liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const download = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const isPdf = contentType?.includes("pdf") || filename?.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <h1>Tài liệu công khai</h1>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={download} disabled={!blobUrl || loading}>Tải xuống</Button>
      </Space>
      <div style={{ border: "1px solid #eee", minHeight: 400 }}>
        {loading && <div>Đang tải...</div>}
        {!loading && blobUrl && isPdf && (
          <iframe title="public-pdf" src={blobUrl} width="100%" height="700px" />
        )}
        {!loading && blobUrl && !isPdf && (
          <div>
            Không thể xem trước định dạng này. Hãy bấm "Tải xuống" để tải file.
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicViewer;
