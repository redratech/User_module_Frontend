import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getUsers } from "../features/users/userSlice";
import UserTable from "../components/UserTable";
import EditUserModal from "../components/EditUserModal";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import { toast } from "react-toastify";

const ROLES = [
  "Developer",
  "Tester",
  "DevOps",
  "Human Resource",
  "Manager",
  "Admin",
  "Digital Marketer"
];

// Color palette for role analytics graphs
const ROLE_COLORS = {
  "Developer": "#6366f1",
  "Tester": "#10b981",
  "DevOps": "#f97316",
  "Human Resource": "#ec4899",
  "Manager": "#a855f7",
  "Admin": "#ef4444",
  "Digital Marketer": "#06b6d4"
};

function UserList() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  
  // Active UI overlays
  const [editingUser, setEditingUser] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Search & Filtration states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  // Filter & Sort process logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = selectedRole === "" || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "alpha-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (sortBy === "alpha-desc") {
      return (b.name || "").localeCompare(a.name || "");
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }
    // Default: newest
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  // Pagination bounds checks
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? 1 : currentPage;
  
  const paginatedUsers = sortedUsers.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Reset page index on search filters update
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(selectedRole === role ? "" : role);
    setCurrentPage(1);
  };

  // Compile directory rows and generate export CSV Blob
  const handleCSVExport = () => {
    if (sortedUsers.length === 0) {
      toast.warning("No users match the current filters to export.");
      return;
    }

    const headers = ["ID", "Full Name", "Email Address", "Phone Number", "Role Type", "Joined Date", "Attachments List"];
    const rows = sortedUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.phone}"`,
      `"${u.role}"`,
      `"${new Date(u.created_at).toLocaleString()}"`,
      `"${(u.documents || []).join(" | ")}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `UserSpace_Directory_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${sortedUsers.length} profile rows to CSV!`);
  };

  // Calculate stats for Analytics grid
  const totalProfiles = users.length;
  const totalDocsCount = users.reduce((sum, u) => sum + (u.documents?.length || 0), 0);
  
  // Calculate role breakdowns
  const roleBreakdown = ROLES.reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length;
    return acc;
  }, {});

  const renderSkeleton = () => (
    <div className="table-container" style={{ padding: "1.5rem" }}>
      <div className="skeleton-row" style={{ width: "25%", marginBottom: "1.5rem" }}>
        <div className="skeleton-bar" style={{ height: "1.5rem" }}></div>
      </div>
      <div className="skeleton-row" style={{ gap: "0.75rem" }}>
        <div className="skeleton-bar" style={{ height: "3rem" }}></div>
        <div className="skeleton-bar" style={{ height: "3rem" }}></div>
        <div className="skeleton-bar" style={{ height: "3rem" }}></div>
        <div className="skeleton-bar" style={{ height: "3rem" }}></div>
      </div>
    </div>
  );

  return (
    <div>
      {/* 1. Page Title Header & Export Actions */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Directory Space</h1>
          <p className="page-subtitle">
            Search, filter, and analyze member credentials or export the directory dataset.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-mobile-full" 
            onClick={handleCSVExport}
            disabled={users.length === 0}
          >
            📥 Export CSV ({sortedUsers.length})
          </button>
          <Link to="/add-user" className="btn btn-primary btn-mobile-full">
            ➕ Register User
          </Link>
        </div>
      </div>

      {/* 2. Interactive Collapsible Analytics Dashboard */}
      {totalProfiles > 0 && (
        <div className="analytics-section">
          <button 
            className="analytics-trigger-btn"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            📊 {showAnalytics ? "Hide Data Analytics" : "View Data Analytics"}
          </button>
          
          {showAnalytics && (
            <div className="analytics-grid">
              
              {/* Counter Stat Cards */}
              <div className="stat-card">
                <span className="stat-header">Total Profiles</span>
                <span className="stat-value">{totalProfiles}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Registered organizational accounts
                </span>
              </div>

              <div className="stat-card">
                <span className="stat-header">Verified Attachments</span>
                <span className="stat-value">{totalDocsCount}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Total uploaded verification files
                </span>
              </div>

              {/* Roles Breakdown Stat Card */}
              <div className="stat-card" style={{ gridColumn: "span 2" }}>
                <span className="stat-header">Organizational Role Spans</span>
                <div className="stat-progress-list" style={{ marginTop: "0.5rem" }}>
                  {ROLES.map((role) => {
                    const count = roleBreakdown[role] || 0;
                    const pct = totalProfiles > 0 ? Math.round((count / totalProfiles) * 100) : 0;
                    
                    if (count === 0) return null; // Only show active roles
                    
                    return (
                      <div key={role} className="stat-progress-item">
                        <div className="progress-label-row">
                          <span style={{ fontWeight: "600" }}>{role}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: ROLE_COLORS[role] || "var(--primary)" 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 3. Search and Filtration Widget Card */}
      {totalProfiles > 0 && (
        <div className="filter-card">
          <div className="search-row">
            {/* Search query box */}
            <div className="search-input-wrapper">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search name or email address..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Sorting select list */}
            <select
              className="form-control"
              style={{ width: "200px" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest Joined</option>
              <option value="oldest">Sort: Oldest Joined</option>
              <option value="alpha-asc">Sort: Alphabetical (A-Z)</option>
              <option value="alpha-desc">Sort: Alphabetical (Z-A)</option>
            </select>
          </div>

          {/* Quick role filtration chips */}
          <div className="role-pills-container">
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center", marginRight: "0.5rem", fontWeight: "600" }}>
              FILTER BY ROLE:
            </span>
            <span 
              className={`role-pill ${selectedRole === "" ? "active" : ""}`}
              onClick={() => setSelectedRole("")}
            >
              All Roles
            </span>
            {ROLES.map((role) => {
              const count = roleBreakdown[role] || 0;
              if (count === 0) return null; // Only show filters for roles that have registered users
              
              return (
                <span
                  key={role}
                  className={`role-pill ${selectedRole === role ? "active" : ""}`}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role} ({count})
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Directory Output Grid/Table */}
      {loading && users.length === 0 ? (
        renderSkeleton()
      ) : sortedUsers.length === 0 ? (
        /* Empty Filters view */
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
          <h2 style={{ marginBottom: "0.5rem" }}>No matching records found</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Adjust your search keywords or role filters to display matching profiles.
          </p>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery("");
              setSelectedRole("");
            }}
          >
            Clear Filter Restrictions
          </button>
        </div>
      ) : (
        <>
          <UserTable 
            users={paginatedUsers} 
            onEditUser={(user) => setEditingUser(user)} 
            onPreviewDoc={(url) => setPreviewUrl(url)}
          />

          {/* 5. Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={activePage === 1}
                style={{ opacity: activePage === 1 ? 0.5 : 1 }}
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`page-num-btn ${activePage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={activePage === totalPages}
                style={{ opacity: activePage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* 6. Edit User Modal Overlay */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* 7. Document Preview Modal Overlay */}
      {previewUrl && (
        <DocumentPreviewModal
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}

export default UserList;