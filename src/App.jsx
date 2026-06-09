import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddUser from "./pages/AddUser";
import UserList from "./pages/UserList";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Main Header / Top Navigation */}
        <header className="main-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">U</div>
              <span className="logo-text">UserModule</span>
            </div>
            
            <nav className="nav-links">
              <NavLink 
                to="/users" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                📁 Directory
              </NavLink>
              <NavLink 
                to="/add-user" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                ➕ Add User
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/users" />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/add-user" element={<AddUser />} />
          </Routes>
        </main>
      </div>

      {/* Toast Alert Engine */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;