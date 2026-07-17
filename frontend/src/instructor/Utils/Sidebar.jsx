import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHome, AiOutlineLogout } from "react-icons/ai";
import { FaBook, FaChalkboardTeacher } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, setUser, setIsAuth } = UserData();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="instructor-sidebar">
      <Link to="/instructor/dashboard" className="instructor-brand">E-Learning<span>Instructor</span></Link>
      <ul>
        <li>
          <Link to={user?.role === "instructor" ? "/instructor/dashboard" : "/admin/dashboard"}>
            <div className="icon">
              <AiFillHome />
            </div>
            <span>Dashboard</span>
          </Link>
        </li>
        {user?.role === "instructor" && (
          <li>
            <Link to="/instructor/lectures">
              <div className="icon"><FaVideo /></div>
              <span>Lectures</span>
            </Link>
          </li>
        )}
        <li>
          <Link to={user?.role === "instructor" ? "/instructor/courses" : "/admin/course"}>
            <div className="icon">
              <FaBook />
            </div>
            <span>Courses</span>
          </Link>
        </li>
        {user?.mainrole === "superadmin" && (
          <li>
            <Link to="/admin/users">
              <div className="icon">
                <FaChalkboardTeacher />
              </div>
              <span>Users</span>
            </Link>
          </li>
        )}
        <li>
          <button type="button" onClick={logoutHandler} className="sidebar-button">
            <div className="icon">
              <AiOutlineLogout />
            </div>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
