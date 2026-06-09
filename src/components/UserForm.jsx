import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createUser } from "../features/users/userSlice";

// Country configuration for phone number limits
const COUNTRIES = [
  { name: "India", code: "+91", length: 10, placeholder: "9876543210" },
  { name: "United States", code: "+1", length: 10, placeholder: "2025550199" },
  { name: "United Kingdom", code: "+44", length: 10, placeholder: "7911123456" },
  { name: "UAE", code: "+971", length: 9, placeholder: "501234567" },
  { name: "Singapore", code: "+65", length: 8, placeholder: "81234567" }
];

function UserForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { loading } = useSelector((state) => state.users);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountryIdx, setSelectedCountryIdx] = useState(0);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [documents, setDocuments] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) {
      setDocuments([]);
      return;
    }
    
    if (selectedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 files.");
      e.target.value = null; // Clear input
      return;
    }
    
    setDocuments(selectedFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory Field Checks
    if (!name.trim()) return toast.warning("Name is mandatory");
    if (!email.trim()) return toast.warning("Email is mandatory");
    if (!phone.trim()) return toast.warning("Phone number is mandatory");
    if (!role) return toast.warning("User role is mandatory");
    if (documents.length === 0) return toast.warning("At least one document upload is mandatory");

    // 2. Name validation: Text (letters and spaces) only
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return toast.warning("Name can only contain alphabetic letters and spaces.");
    }

    // 3. Email Pattern Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return toast.warning("Please enter a valid email address (e.g. user@example.com)");
    }

    // 4. Phone validation: check length for the selected country
    const country = COUNTRIES[selectedCountryIdx];
    if (phone.length !== country.length) {
      return toast.warning(
        `Phone number for ${country.name} must be exactly ${country.length} digits long.`
      );
    }

    const fullPhone = `${country.code} ${phone}`;

    // 5. Document limits
    if (documents.length > 5) {
      return toast.error("Maximum limit is 5 documents.");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("phone", fullPhone);
    formData.append("role", role);

    for (let i = 0; i < documents.length; i++) {
      formData.append("documents", documents[i]);
    }

    try {
      await dispatch(createUser(formData)).unwrap();
      toast.success("User created successfully!");
      
      // Reset Form State
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
      setDocuments([]);
      
      // Navigate to Directory
      navigate("/users");
    } catch (error) {
      toast.error(error.message || "Failed to create user profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Name Field */}
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => {
            // Allow letters and spaces only
            const val = e.target.value;
            if (val === "" || /^[A-Za-z\s]+$/.test(val)) {
              setName(val);
            }
          }}
          disabled={loading}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Letters and spaces only</span>
      </div>

      {/* Email Field */}
      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          type="email"
          className="form-control"
          placeholder="johndoe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Phone Field with Country Selector */}
      <div className="form-group">
        <label className="form-label">Phone Number *</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            className="form-control"
            style={{ width: "135px", flexShrink: 0 }}
            value={selectedCountryIdx}
            onChange={(e) => {
              setSelectedCountryIdx(Number(e.target.value));
              setPhone(""); // Reset input when country changes
            }}
            disabled={loading}
          >
            {COUNTRIES.map((country, idx) => (
              <option key={country.code} value={idx}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
          
          <input
            type="text"
            className="form-control"
            placeholder={COUNTRIES[selectedCountryIdx].placeholder}
            value={phone}
            onChange={(e) => {
              // Numbers only
              const val = e.target.value.replace(/\D/g, "");
              // Cap length at selected country's limit
              if (val.length <= COUNTRIES[selectedCountryIdx].length) {
                setPhone(val);
              }
            }}
            disabled={loading}
          />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Must be exactly {COUNTRIES[selectedCountryIdx].length} digits for {COUNTRIES[selectedCountryIdx].name}
        </span>
      </div>

      {/* Role Selection Dropdown */}
      <div className="form-group">
        <label className="form-label">User Role *</label>
        <select
          className="form-control"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          <option value="">Select User Role</option>
          <option value="Developer">Developer</option>
          <option value="Tester">Tester</option>
          <option value="DevOps">DevOps</option>
          <option value="Human Resource">Human Resource</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
          <option value="Digital Marketer">Digital Marketer</option>
        </select>
      </div>

      {/* Custom File Upload Dropzone */}
      <div className="form-group">
        <label className="form-label">Document Attachments * (1 to 5 files)</label>
        <div 
          className="file-dropzone" 
          onClick={triggerFileInput}
          style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
        >
          <span className="file-icon">📁</span>
          <span className="file-dropzone-text">Click to choose documents to upload</span>
          <span className="file-dropzone-subtext">PDF, DOC, JPG or PNG (At least 1 is required)</span>
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
        {documents.length > 0 && (
          <div className="selected-files-list">
            {documents.map((doc, idx) => (
              <div key={idx} className="selected-file-item">
                <span>📄 {doc.name}</span>
                <span>{(doc.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <br />

      {/* Submit Button */}
      <button 
        type="submit" 
        className={`btn btn-primary btn-mobile-full ${loading ? 'btn-disabled' : ''}`}
        disabled={loading}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {loading ? (
          <>
            <div className="spinner"></div>
            <span>Creating User...</span>
          </>
        ) : (
          "Register User"
        )}
      </button>
    </form>
  );
}

export default UserForm;