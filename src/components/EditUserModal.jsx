import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateUser } from "../features/users/userSlice";

const COUNTRIES = [
  { name: "India", code: "+91", length: 10, placeholder: "9876543210" },
  { name: "United States", code: "+1", length: 10, placeholder: "2025550199" },
  { name: "United Kingdom", code: "+44", length: 10, placeholder: "7911123456" },
  { name: "UAE", code: "+971", length: 9, placeholder: "501234567" },
  { name: "Singapore", code: "+65", length: 8, placeholder: "81234567" }
];

function EditUserModal({ user, onClose }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { loading } = useSelector((state) => state.users);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);

  // Prepopulate form fields with existing user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setExistingDocuments(user.documents || []);

      // Parse country dialing code and raw phone number digits
      if (user.phone) {
        const matched = COUNTRIES.find((c) => user.phone.startsWith(c.code));
        if (matched) {
          const idx = COUNTRIES.indexOf(matched);
          setSelectedCountryIdx(idx);
          setPhone(user.phone.substring(matched.code.length).trim());
        } else {
          setPhone(user.phone);
        }
      }
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) {
      setNewDocuments([]);
      return;
    }

    const totalDocs = existingDocuments.length + selectedFiles.length;
    if (totalDocs > 5) {
      toast.error("Combined documents (existing + new) cannot exceed 5.");
      e.target.value = null;
      return;
    }

    setNewDocuments(selectedFiles);
  };

  const removeExistingDoc = (docUrl) => {
    setExistingDocuments((prev) => prev.filter((url) => url !== docUrl));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name.trim()) return toast.warning("Name is mandatory");
    if (!email.trim()) return toast.warning("Email is mandatory");
    if (!phone.trim()) return toast.warning("Phone number is mandatory");
    if (!role) return toast.warning("User role is mandatory");

    // Name check: letters only
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return toast.warning("Name must contain letters and spaces only.");
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return toast.warning("Please enter a valid email address");
    }

    // Phone limit check
    const country = COUNTRIES[selectedCountryIdx];
    if (phone.length !== country.length) {
      return toast.warning(
        `Phone number for ${country.name} must be exactly ${country.length} digits.`
      );
    }

    const fullPhone = `${country.code} ${phone}`;

    // Total documents count limits
    const totalDocs = existingDocuments.length + newDocuments.length;
    if (totalDocs === 0) {
      return toast.warning("At least one document is mandatory.");
    }
    if (totalDocs > 5) {
      return toast.error("Maximum limit is 5 documents.");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("phone", fullPhone);
    formData.append("role", role);
    
    // Send existing documents array as JSON string
    formData.append("existingDocuments", JSON.stringify(existingDocuments));

    // Send newly added documents
    for (let i = 0; i < newDocuments.length; i++) {
      formData.append("documents", newDocuments[i]);
    }

    try {
      await dispatch(updateUser({ id: user.id, formData })).unwrap();
      toast.success("User profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update user profile.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Edit User Profile</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[A-Za-z\s]+$/.test(val)) {
                    setName(val);
                  }
                }}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  className="form-control"
                  style={{ width: "135px", flexShrink: 0 }}
                  value={selectedCountryIdx}
                  onChange={(e) => {
                    setSelectedCountryIdx(Number(e.target.value));
                    setPhone(""); // reset input on change
                  }}
                  disabled={loading}
                >
                  {COUNTRIES.map((c, idx) => (
                    <option key={c.code} value={idx}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="form-control"
                  placeholder={COUNTRIES[selectedCountryIdx].placeholder}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= COUNTRIES[selectedCountryIdx].length) {
                      setPhone(val);
                    }
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">User Role *</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="Developer">Developer</option>
                <option value="Tester">Tester</option>
                <option value="DevOps">DevOps</option>
                <option value="Human Resource">Human Resource</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Digital Marketer">Digital Marketer</option>
              </select>
            </div>

            {/* Existing Files */}
            <div className="form-group">
              <label className="form-label">Current Documents</label>
              {existingDocuments.length === 0 ? (
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                  No documents remaining. You must upload a new document below.
                </span>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem" }}>
                  {existingDocuments.map((url, idx) => (
                    <div key={idx} className="existing-doc-item">
                      <a href={url} target="_blank" rel="noreferrer">
                        📄 Document {idx + 1}
                      </a>
                      <button 
                        type="button" 
                        className="btn-remove-doc" 
                        onClick={() => removeExistingDoc(url)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Upload Dropzone */}
            <div className="form-group">
              <label className="form-label">Add New Documents</label>
              <div 
                className="file-dropzone" 
                onClick={triggerFileInput}
                style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
              >
                <span className="file-icon">📁</span>
                <span className="file-dropzone-text">Click to choose documents to upload</span>
                <span className="file-dropzone-subtext">PDF, DOC, JPG or PNG</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              {/* Selected Files Preview List */}
              {newDocuments.length > 0 && (
                <div className="selected-files-list">
                  {newDocuments.map((doc, idx) => (
                    <div key={idx} className="selected-file-item">
                      <span>📄 {doc.name}</span>
                      <span>{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <br />

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose} 
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default EditUserModal;
