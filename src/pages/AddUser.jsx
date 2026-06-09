import { Link } from "react-router-dom";
import UserForm from "../components/UserForm";

function AddUser() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Create New Profile</h1>
          <p className="page-subtitle">Add a new user and upload verified documents to their profile.</p>
        </div>
        <Link to="/users" className="btn btn-secondary btn-mobile-full">
          ← Back to Directory
        </Link>
      </div>

      <div className="card">
        <UserForm />
      </div>
    </div>
  );
}

export default AddUser;
