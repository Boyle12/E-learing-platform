import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { CourseData } from "../../context/CourseContext";

const roles = ["student", "instructor", "admin"];

const Login = () => {
  const navigate = useNavigate();
  const { btnLoading, loginUser } = UserData();
  const { fetchMyCourse } = CourseData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    const user = await loginUser(email, password, role, fetchMyCourse);

    if (!user) return;

    if (user.role !== role) {
      setError(`You selected ${role}. Your account is registered as ${user.role}.`);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    if (role === "admin") return navigate("/admin/dashboard");
    if (role === "instructor") return navigate("/instructor/dashboard");
    return navigate(`/${user._id}/dashboard`);
  };

  return (
    <div className="auth-page auth-login-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo">E-Learning</div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your learning dashboard.</p>
        </div>

        <div className="role-tabs">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              className={role === item ? "tab active" : "tab"}
              onClick={() => setRole(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={submitHandler} className="auth-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className="auth-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <Link to="/forgot" className="link-text">
              Forgot Password?
            </Link>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button disabled={btnLoading} type="submit" className="auth-button">
            {btnLoading ? "Signing in..." : "Login"}
          </button>

          <button type="button" className="auth-button google-button">
            Continue with Google
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
