import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">

        <main
          className={`transition-all duration-300 overflow-x-hidden overflow-y-auto bg-gray-200 ${
            isOpen ? "ml-64" : "ml-20"
          }`}
        >
          <div className="container mx-auto px-6 py-3">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--primary-color)",
            color: "#fff",
          },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />
    </div>
  );
};

export default AdminLayout;
