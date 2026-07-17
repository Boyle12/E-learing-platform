import React from "react";
import Sidebar from "./Sidebar";
import "./common.css";

const Layout = ({ children }) => {
  return (
    <div className="instructor-layout">
      <Sidebar />
      <main className="instructor-content">{children}</main>
    </div>
  );
};

export default Layout;
