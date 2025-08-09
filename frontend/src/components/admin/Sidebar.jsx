import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const sidebarOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle = toggleSidebar || (() => setInternalIsOpen(!internalIsOpen));

  return (
    <div
      className="fixed top-0 left-0 h-screen bg-[var(--primary-color)] text-white flex flex-col transition-all duration-300 z-50"
      style={{ width: sidebarOpen ? "16rem" : "5rem" }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white border-opacity-20 flex-shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="min-w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="font-bold text-lg" style={{ color: "var(--primary-color)" }}>
                E
              </span>
            </div>
            <span className="font-semibold">EcomStore</span>
          </div>
        ) : (
          <div></div>
        )}

        <button
          onClick={handleToggle}
          className={`p-1 rounded-full hover:bg-[var(--secondary-color)] hover:bg-opacity-20 transition-colors ${
            !sidebarOpen ? "mx-auto" : ""
          }`}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="flex-1" />

      {/* Optional custom scrollbar styles can be omitted here */}
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
