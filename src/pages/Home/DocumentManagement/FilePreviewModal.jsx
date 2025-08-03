import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Spin, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext"; // Adjusted
import WebViewer from "@pdftron/webviewer";

const FilePreviewModal = ({ open, onCancel, fileId, fileName, password }) => {
  const { token } = useAuth(); // Adjusted
  const viewerDivRef = useRef(null);
  const webViewerInstance = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      if (webViewerInstance.current) {
        webViewerInstance.current.UI.loadDocument("");
      }
      return;
    }

    if (!webViewerInstance.current && viewerDivRef.current) {
      setLoading(true);
      WebViewer(
        {
          path: "/webviewer",
          initialDoc: "",
          licenseKey:
            "demo:namdotatks48@gmail.com:6184df0b0200000000d73f55b79bdee95325d2e1ea5a4f1bfe3b603ed1",
          disabledElements: [
            "ribbons",
            "toolsHeader",
            "leftPanel",
            "rightPanel",
            "menuButton",
            "viewControlsButton",
            "searchButton",
            "printButton",
            "downloadButton",
            "thumbnailsPanelButton",
            "outlinesPanelButton",
            "annotationsPanelButton",
            "bookmarksPanelButton",
            "layersPanelButton",
            "redactionButton",
            "signatureToolButton",
            "formFillToolButton",
            "stickyToolButton",
            "highlightToolButton",
            "underlineToolButton",
            "strikeoutToolButton",
            "squigglyToolButton",
            "freeTextToolButton",
            "calloutToolButton",
            "lineToolButton",
            "arrowToolButton",
            "polylineToolButton",
            "polygonToolButton",
            "cloudToolButton",
            "rectangleToolButton",
            "ellipseToolButton",
            "circleToolButton",
            "rulerToolButton",
            "protractorToolButton",
            "perimeterToolButton",
            "areaToolButton",
            "eraserToolButton",
            "cropToolButton",
            "rotateToolButton",
            "flipToolButton",
            "textSelectToolButton",
            "panToolButton",
            "zoomToolButton",
          ],
        },
        viewerDivRef.current
      )
        .then((instance) => {
          webViewerInstance.current = instance;
          const { documentViewer } = instance.Core;

          documentViewer.addEventListener("documentLoaded", () => {
            setLoading(false);
          });

          documentViewer.addEventListener("documentUnloaded", () => {
            setLoading(true);
          });

          if (fileId && token) {
            const loadDoc = async () => {
              try {
                const response = await fetch(
                  `http://localhost:8080/api/v1/documents/${fileId}/retrieve?password=${
                    password || ""
                  }&withWatermark=true`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.ok) {
                  const blob = await response.blob();
                  instance.UI.loadDocument(blob, {
                    filename: fileName || "document",
                  });
                } else {
                  message.error(
                    "Không thể xem tệp. Vui lòng kiểm tra mật khẩu hoặc thử lại sau."
                  );
                  setLoading(false);
                }
              } catch (error) {
                message.error("Lỗi khi tải nội dung tệp.");
                setLoading(false);
              }
            };
            loadDoc();
          }
        })
        .catch((error) => {
          message.error("Lỗi khi khởi tạo trình xem tài liệu.");
          setLoading(false);
        });
    } else if (open && webViewerInstance.current && fileId && token) {
      const loadDoc = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/v1/documents/${fileId}/retrieve?password=${
              password || ""
            }&withWatermark=true`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const blob = await response.blob();
            webViewerInstance.current.UI.loadDocument(blob, {
              filename: fileName || "document",
            });
          } else {
            message.error(
              "Không thể xem tệp. Vui lòng kiểm tra mật khẩu hoặc thử lại sau."
            );
            setLoading(false);
          }
        } catch (error) {
          message.error("Lỗi khi tải nội dung tệp.");
          setLoading(false);
        }
      };
      loadDoc();
    }
  }, [open, fileId, fileName, password, token]);

  const handleDownload = () => {
    if (fileId && fileName) {
      window.open(
        `http://localhost:8080/api/v1/documents/${fileId}/retrieve?password=${
          password || ""
        }&withWatermark=true`,
        "_blank"
      );
    }
  };

  return (
    <Modal
      title={`Xem tệp: ${fileName}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Đóng
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Tải xuống
        </Button>,
      ]}
      width="80%"
      style={{ top: 20 }}
      styles={{ body: { height: "80vh", overflow: "hidden" } }}
      getContainer={false}
      zIndex={10000}
    >
      {loading && (
        <Spin
          tip="Đang tải nội dung tệp..."
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        />
      )}
      <div ref={viewerDivRef} style={{ height: "100%", width: "100%" }}></div>
    </Modal>
  );
};

export default FilePreviewModal;
