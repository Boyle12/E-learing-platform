import React, { useState, useEffect } from "react";
import "./auth.css";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { CourseData } from "../../context/CourseContext";

const LoginPortal = ({ expectedRole, title }) => {
  const navigate = useNavigate();
  const { btnLoading, loginUser, isAuth, user } = UserData();
  const { fetchMyCourse } = CourseData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuth && user) {
      if (user.role === "admin") return navigate("/admin/dashboard");
      if (user.role === "instructor") return navigate("/instructor/dashboard");
      return navigate(`/${user._id}/dashboard`);
    }
  }, [isAuth, user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const loggedUser = await loginUser(email, password, fetchMyCourse);
    if (!loggedUser) return;

    if (loggedUser.role !== expectedRole) {
      alert(`This login page is for ${title} only. You are logged in as ${loggedUser.role}.`);
      if (loggedUser.role === "admin") navigate("/admin/dashboard");
      else if (loggedUser.role === "instructor") navigate("/instructor/dashboard");
      else navigate(`/${loggedUser._id}/dashboard`);
      return;
    }

    if (expectedRole === "user") {
      navigate(`/${loggedUser._id}/dashboard`);
      return;
    }

    if (expectedRole === "instructor") {
      navigate("/instructor/dashboard");
      return;
    }

    if (expectedRole === "admin") {
      navigate("/admin/dashboard");
      return;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>{title} Login</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={btnLoading} type="submit" className="common-btn">
            {btnLoading ? "Please Wait..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPortal;
