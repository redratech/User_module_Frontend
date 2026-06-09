import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { deleteUser } from "../features/users/userSlice";

function UserTable({ users, onEditUser, onPreviewDoc }) {
  const dispatch = useDispatch();

  // Helper to extract initials for user avatars
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Helper to resolve role badges
  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "badge badge-admin";
      case "developer":
        return "badge badge-developer";
      case "tester":
        return "badge badge-tester";
      case "devops":
        return "badge badge-devops";
      case "human resource":
        return "badge badge-hr";
      case "manager":
        return "badge badge-manager";
      case "digital marketer":
        return "badge badge-marketing";
      default:
        return "badge badge-default";
    }
  };

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "Joined recently";
    const d = new Date(dateStr);
    return `Joined on ${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })}`;
  };

  // Handle Delete Confirmation and dispatch
  const handleDeleteClick = async (user) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the user profile of ${user.name}?`
    );

    if (isConfirmed) {
      try {
        await dispatch(deleteUser(user.id)).unwrap();
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to delete user.");
      }
    }
  };

  return (
    <>
      {/* 1. Desktop Layout (Table) */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Verified Documents</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                {/* User Name & Email Avatar Cell */}
                <td>
                  <div className="user-info-cell">
                    <div className="user-avatar">{getInitials(user.name)}</div>
                    <div>
                      <div className="user-name-title">{user.name}</div>
                      <div className="user-email-subtitle">{user.email}</div>
                      <div className="joined-date-text">{formatDate(user.created_at)}</div>
                    </div>
                  </div>
                </td>

                {/* Phone Cell */}
                <td style={{ color: "var(--text-secondary)" }}>
                  {user.phone}
                </td>

                {/* Role Badge Cell */}
                <td>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </td>

                {/* Documents Cell */}
                <td>
                  <div className="document-list">
                    {user.documents && user.documents.length > 0 ? (
                      user.documents.map((doc, index) => (
                        <button
                          key={index}
                          type="button"
                          className="doc-chip"
                          onClick={() => onPreviewDoc(doc)}
                          style={{ cursor: "pointer", border: "1px solid var(--border-color)", background: "var(--bg-hover)" }}
                        >
                          📄 Doc {index + 1}
                        </button>
                      ))
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No attachments
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions Cell */}
                <td>
                  <div className="actions-cell">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => onEditUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDeleteClick(user)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Layout (Card Grid) */}
      <div className="user-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            {/* Header with Avatar & Role */}
            <div className="user-card-header">
              <div className="user-info-cell">
                <div className="user-avatar">{getInitials(user.name)}</div>
                <div>
                  <div className="user-name-title">{user.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {user.email}
                  </div>
                  <div className="joined-date-text" style={{ fontSize: "0.7rem" }}>
                    {formatDate(user.created_at)}
                  </div>
                </div>
              </div>
              <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
            </div>

            {/* Contact Details */}
            <div className="user-card-body">
              <div className="user-card-row">
                <span className="user-card-icon">📞</span>
                <span>{user.phone}</span>
              </div>
            </div>

            {/* Document Attachments */}
            <div className="user-card-docs">
              <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                ATTACHMENTS ({user.documents?.length || 0})
              </div>
              <div className="document-list">
                {user.documents && user.documents.length > 0 ? (
                  user.documents.map((doc, index) => (
                    <button
                      key={index}
                      type="button"
                      className="doc-chip"
                      onClick={() => onPreviewDoc(doc)}
                      style={{ cursor: "pointer", border: "1px solid var(--border-color)", background: "var(--bg-hover)" }}
                    >
                      📄 Doc {index + 1}
                    </button>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    No documents uploaded
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Actions Footer */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
              <button
                className="btn btn-sm btn-edit"
                style={{ flex: 1 }}
                onClick={() => onEditUser(user)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-delete"
                style={{ flex: 1 }}
                onClick={() => handleDeleteClick(user)}
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>
    </>
  );
}

export default UserTable;