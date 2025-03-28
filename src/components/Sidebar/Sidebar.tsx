import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useRef } from "react";

interface SubMenuItem {
  label: string;
  link?: string;
  action?: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  link?: string;
  isActive?: boolean;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  menuItems: MenuItem[];
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  bgColor?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems, isExpanded, setIsExpanded, bgColor }) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleToggleSidebar = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  const handleMouseEnter = (index: number) => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    timeoutId.current = setTimeout(() => setHoveredItem(null), 200);
  };

  return (
    <div
      className={`h-screen ${bgColor || "bg-primary"} text-white transition-all duration-300
      ${isExpanded ? "w-56" : "w-16"} border-r border-gray-800 flex flex-col`}
    >
      <div className="p-4 flex items-center gap-2">
        <button
          onClick={handleToggleSidebar}
          className="p-2 hover:bg-purple-900 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "w-36" : "w-8"}`}>
          <img
            src={isExpanded ? "/images/logo.png" : "/images/logoOnly.png"}
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <li key={index} className="relative" onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={hoveredItem === index}
                  onClick={() => {
                    if (hasSubItems) {
                      setHoveredItem(hoveredItem === index ? null : index);
                    } else if (item.link) {
                      navigate(item.link);
                    }
                  }}
                  className={`flex items-center p-3 mx-2 rounded-lg cursor-pointer 
                  ${item.isActive ? "text-purple-500" : "text-gray-400"} 
                  hover:bg-purple-900`}
                >
                  <Icon className="w-6 h-6 min-w-6" />
                  {isExpanded && <span className="ml-3 text-sm">{item.label}</span>}
                </div>

                {hasSubItems && hoveredItem === index && (
                  <div
                    className={`absolute ${isExpanded ? "left-full -ml-2" : "left-16"} top-0 z-10 bg-purple-950 
                    rounded-lg shadow-lg py-2 w-48 transition-opacity duration-200`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.subItems?.map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (subItem.action) {
                            subItem.action();
                          } else if (subItem.link) {
                            navigate(subItem.link);
                          }
                        }}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-900 hover:text-white cursor-pointer"
                      >
                        {subItem.label}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
