import React from "react";
import "./App.css";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import Loading from "./components/loading/Loading";
import Courses from "./pages/courses/Courses";
import CourseDescription from "./pages/coursedescription/CourseDescription";
import PaymentSuccess from "./pages/paymentsuccess/PaymentSuccess";
import Dashbord from "./pages/dashbord/Dashbord";
import CourseStudy from "./pages/coursestudy/CourseStudy";
import Lecture from "./pages/lecture/Lecture";
import AdminCourses from "./admin/Courses/AdminCourses";
import InstructorDashboard from "./instructor/Dashboard/InstructorDashboard";
import InstructorCourses from "./instructor/Courses/InstructorCourses";
import InstructorLectures from "./instructor/Lectures/InstructorLectures";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./views/admin/AdminDashboard";
import GlobalSettings from "./views/admin/GlobalSettings";
import AdminLayout from "./components/admin/AdminLayout";
import AdminManagementPage, { AdminReports } from "./views/admin/AdminManagementPage";
import AdminAnalytics from "./views/admin/AdminAnalytics";

const AppRoutes = ({ isAuth, user }) => {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor");

  return (
    <>
      {!isPortalRoute && <Header isAuth={isAuth} />}
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="/account"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
            <Route
              path="/forgot"
              element={isAuth ? <Home /> : <ForgotPassword />}
            />
            <Route
              path="/reset-password/:token"
              element={isAuth ? <Home /> : <ResetPassword />}
            />
            <Route
              path="/course/:id"
              element={isAuth ? <CourseDescription user={user} /> : <Login />}
            />
            <Route
              path="/payment-success/:id"
              element={isAuth ? <PaymentSuccess user={user} /> : <Login />}
            />
            <Route path="/:id/dashboard" element={isAuth ? <Dashbord user={user} /> : <Login />} />
            <Route path="/course/study/:id" element={isAuth ? <CourseStudy user={user} /> : <Login />} />
            <Route path="/lectures/:id" element={isAuth ? <Lecture user={user} /> : <Login />} />
            <Route path="/admin" element={isAuth && user?.role === "admin" ? <AdminLayout /> : <Navigate to="/" replace />}>
              <Route index element={<AdminDashboard />} /><Route path="dashboard" element={<AdminDashboard />} /><Route path="course" element={<AdminCourses user={user} />} /><Route path="courses" element={<AdminCourses user={user} />} /><Route path="settings" element={<GlobalSettings />} />
              <Route path="students" element={<AdminManagementPage type="students" />} />
              <Route path="users" element={<AdminManagementPage type="users" />} />
              <Route path="instructors" element={<AdminManagementPage type="instructors" />} />
              <Route path="lectures" element={<AdminManagementPage type="lectures" />} />
              <Route path="categories" element={<AdminManagementPage type="categories" />} />
              <Route path="enrollments" element={<AdminManagementPage type="enrollments" />} />
              <Route path="payments" element={<AdminManagementPage type="payments" />} />
              <Route path="reviews" element={<AdminManagementPage type="reviews" />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
            <Route path="/instructor/dashboard" element={isAuth && user?.role === "instructor" ? <InstructorDashboard user={user} /> : <Navigate to="/" replace />} />
            <Route path="/instructor/courses" element={isAuth && user?.role === "instructor" ? <InstructorCourses user={user} /> : <Navigate to="/" replace />} />
            <Route path="/instructor/lectures" element={isAuth && user?.role === "instructor" ? <InstructorLectures user={user} /> : <Navigate to="/" replace />} />
          </Routes>
      {!isPortalRoute && <Footer />}
    </>
  );
};

const App = () => {
  const { isAuth, user, loading } = UserData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <AppRoutes isAuth={isAuth} user={user} />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
