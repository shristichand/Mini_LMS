import { ChevronLeft, ChevronRight, LogOut, LayoutGrid, BookOpen } from "lucide-react"; // import LogOut icon
import { useState } from "react";
import PropTypes from "prop-types";
import { useLogout } from "../../hooks/authHook"; // adjust path to your hook
import { useNavigate, NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const sidebarOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle =
    toggleSidebar || (() => setInternalIsOpen(!internalIsOpen));

  const primaryColor = "#1D4ED8";
  const secondaryColor = "#2563EB";
  const whiteColor = "#FFFFFF";

  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
      onError: () => {
        // optionally handle error, show toast, etc
      },
    });
  };

  return (
    <div
      className="fixed top-0 left-0 h-screen text-white flex flex-col transition-all duration-300 z-50"
      style={{
        width: sidebarOpen ? "16rem" : "5rem",
        backgroundColor: primaryColor,
      }}
    >
      <div
        className="flex items-center justify-between p-4 border-b flex-shrink-0"
        style={{ borderColor: `${whiteColor}33` }}
      >
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div
              className="min-w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: whiteColor }}
            >
              <span
                className="font-bold text-lg"
                style={{ color: primaryColor }}
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
            (e.currentTarget.style.backgroundColor = `${secondaryColor}33`)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {sidebarOpen ? (
            <ChevronLeft size={20} color={whiteColor} />
          ) : (
            <ChevronRight size={20} color={whiteColor} />
          )}
        </button>
      </div>

      {/* Menu */}
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
          <LayoutGrid size={18} color={whiteColor} />
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
          <BookOpen size={18} color={whiteColor} />
          {sidebarOpen && <span>Courses</span>}
        </NavLink>
      </nav>

      {/* Logout button at the bottom */}
      <div className="p-4 border-t" style={{ borderColor: `${whiteColor}33` }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-white/20 transition-colors"
          type="button"
        >
          <LogOut size={20} color={whiteColor} />
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
