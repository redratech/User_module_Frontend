import { useSelector } from "react-redux";

function DocumentPreviewModal({ url, onClose }) {
  const { loading } = useSelector((state) => state.users);

  // Helper to strip UUID prefix and return original filename
  const getCleanFilename = (fileUrl) => {
    if (!fileUrl) return "Document";
    const raw = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    // UUID (36 chars) + 1 hyphen = 37 chars offset
    if (raw.length > 37 && raw.charAt(36) === "-") {
      return decodeURIComponent(raw.substring(37));
    }
    return decodeURIComponent(raw);
  };

  // Helper to determine if file is previewable image
  const isImageFile = (fileUrl) => {
    const path = fileUrl.split('?')[0].toLowerCase();
    return (
      path.endsWith(".jpg") ||
      path.endsWith(".jpeg") ||
      path.endsWith(".png") ||
      path.endsWith(".gif") ||
      path.endsWith(".webp")
    );
  };

  const filename = getCleanFilename(url);
  const isImg = isImageFile(url);
  const fileExtension = url.split('.').pop().split('?')[0].toUpperCase();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: isImg ? "800px" : "500px" }}
      >
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            Document Preview
          </h2>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {isImg ? (
            /* Render Image inline */
            <div className="preview-image-container">
              <img className="preview-img" src={url} alt={filename} />
            </div>
          ) : (
            /* Fallback doc viewer card */
            <div className="preview-file-card">
              <div className="preview-file-icon">📄</div>
              <div className="preview-file-details">
                <div className="preview-file-name">{filename}</div>
                <div className="preview-file-meta">
                  File Format: {fileExtension} Document
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "320px" }}>
                This document format (.pdf/.doc) cannot be rendered inline. Open it directly or download it below.
              </p>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary"
                style={{ width: "100%", maxWidth: "240px" }}
              >
                📥 Open / Download File
              </a>
            </div>
          )}

          {/* Filename subtext */}
          {isImg && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <span style={{ wordBreak: "break-all", fontWeight: "500" }}>{filename}</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer" 
                style={{ fontWeight: "600", textDecoration: "underline", flexShrink: 0 }}
              >
                Open Original
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default DocumentPreviewModal;
