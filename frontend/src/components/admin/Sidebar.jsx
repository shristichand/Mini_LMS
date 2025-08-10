import { ChevronLeft, ChevronRight, LogOut, LayoutGrid, BookOpen } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";
import { useLogout } from "../../hooks/authHook";
import { useNavigate, NavLink } from "react-router-dom";

/**
 * Admin sidebar navigation component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open
 * @param {Function} props.toggleSidebar - Function to toggle sidebar
 * @returns {JSX.Element} Sidebar JSX
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const sidebarOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle =
    toggleSidebar || (() => setInternalIsOpen(!internalIsOpen));

  // Color constants
  const PRIMARY_COLOR = "#1D4ED8";
  const SECONDARY_COLOR = "#2563EB";
  const WHITE_COLOR = "#FFFFFF";

  const logoutMutation = useLogout();
  const navigate = useNavigate();

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
      onError: () => {
        // Optionally handle error, show toast, etc.
        console.warn('Logout error occurred');
      },
    });
  };

  return (
    <div
      className="fixed top-0 left-0 h-screen text-white flex flex-col transition-all duration-300 z-50"
      style={{
        width: sidebarOpen ? "16rem" : "5rem",
        backgroundColor: PRIMARY_COLOR,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b flex-shrink-0"
        style={{ borderColor: `${WHITE_COLOR}33` }}
      >
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div
              className="min-w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: WHITE_COLOR }}
            >
              <span
                className="font-bold text-lg"
                style={{ color: PRIMARY_COLOR }}
              >
                L
              </span>
            </div>
            <span className="font-semibold">LMS</span>
          </div>
        ) : (
          <div></div>
        )}

        <button
          onClick={handleToggle}
          className={`p-1 rounded-full transition-colors ${
            !sidebarOpen ? "mx-auto" : ""
          }`}
          style={{
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = `${SECONDARY_COLOR}33`)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {sidebarOpen ? (
            <ChevronLeft size={20} color={WHITE_COLOR} />
          ) : (
            <ChevronRight size={20} color={WHITE_COLOR} />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 flex-1 px-2 space-y-1">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive ? "bg-white/20" : "hover:bg-white/10"
            }`
          }
        >
          <LayoutGrid size={18} color={WHITE_COLOR} />
          {sidebarOpen && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive ? "bg-white/20" : "hover:bg-white/10"
            }`
          }
        >
          <BookOpen size={18} color={WHITE_COLOR} />
          {sidebarOpen && <span>Courses</span>}
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: `${WHITE_COLOR}33` }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-white/20 transition-colors"
          type="button"
        >
          <LogOut size={20} color={WHITE_COLOR} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
