import { Menu, X, ChevronUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";

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

const Sidebar: React.FC<SidebarProps> = ({ 
  menuItems, 
  isExpanded, 
  setIsExpanded, 
  bgColor 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [activeSubItemIndices, setActiveSubItemIndices] = useState<Record<number, number>>({});
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  // Initialize active items based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    menuItems.forEach((item, index) => {
      if (item.link === currentPath) {
        setActiveItemIndex(index);
      }
      
      if (item.subItems) {
        item.subItems.forEach((subItem, subIndex) => {
          if (subItem.link === currentPath) {
            setActiveItemIndex(index);
            setActiveSubItemIndices(prev => ({ ...prev, [index]: subIndex }));
          }
        });
      }
    });
  }, [location.pathname, menuItems]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsExpanded]);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded, setIsExpanded, isMobile, mobileMenuOpen]);

  const handleMouseEnter = (index: number) => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    timeoutId.current = setTimeout(() => setHoveredItem(null), 200);
  };

  const handleNavigate = (link?: string, itemIndex?: number, subItemIndex?: number) => {
    if (link) {
      navigate(link);
      
      // Update active states
      if (itemIndex !== undefined) {
        setActiveItemIndex(itemIndex);
        
        if (subItemIndex !== undefined) {
          setActiveSubItemIndices(prev => ({ ...prev, [itemIndex]: subItemIndex }));
        }
      }
      
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    }
  };

  const handleItemClick = (item: MenuItem, index: number) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    
    if (hasSubItems) {
      setHoveredItem(hoveredItem === index ? null : index);
    } else if (item.link) {
      handleNavigate(item.link, index);
    }
    
    // Set active item even if it doesn't have a link
    setActiveItemIndex(index);
  };

  const handleSubItemClick = (subItem: SubMenuItem, itemIndex: number, subIndex: number) => {
    if (subItem.action) {
      subItem.action();
      setMobileMenuOpen(false);
    } else if (subItem.link) {
      handleNavigate(subItem.link, itemIndex, subIndex);
    }
  };

  // Helper function to determine if an item is active
  const isItemActive = (index: number) => {
    return activeItemIndex === index || menuItems[index]?.isActive;
  };

  const isSubItemActive = (itemIndex: number, subIndex: number) => {
    return activeSubItemIndices[itemIndex] === subIndex;
  };

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <div
        className={`h-screen ${bgColor || "bg-primary"} text-white transition-all duration-300
        ${isExpanded ? "w-56" : "w-16"} border-r border-gray-800 flex flex-col shadow-lg`}
      >
        <div className="p-4 flex items-center gap-2">
          <button
            onClick={handleToggleSidebar}
            className="p-2 hover:bg-purple-900 rounded-lg transition-colors"
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

        {/* Desktop Navigation */}
        <nav className="flex-1 mt-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const active = isItemActive(index);

              return (
                <li 
                  key={index} 
                  className="relative" 
                  onMouseEnter={() => handleMouseEnter(index)} 
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={hoveredItem === index}
                    onClick={() => handleItemClick(item, index)}
                    className={`flex items-center p-3 mx-2 rounded-lg cursor-pointer 
                    ${active ? "bg-purple-900/50 text-purple-300" : "text-gray-400"} 
                    hover:bg-purple-900 transition-all`}
                  >
                    <Icon className={`w-6 h-6 min-w-6 ${active ? "text-purple-400" : ""}`} />
                    {isExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                    
                    {/* Add a highlight indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-400 rounded-r"></div>
                    )}
                  </div>

                  {hasSubItems && hoveredItem === index && (
                    <div
                      className={`absolute ${isExpanded ? "left-full -ml-2" : "left-16"} top-0 z-10 bg-purple-950 
                      rounded-lg shadow-lg py-2 w-48 transition-all duration-200 border border-purple-800`}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.subItems?.map((subItem, subIndex) => {
                        const isSubActive = isSubItemActive(index, subIndex);
                        
                        return (
                          <div
                            key={subIndex}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSubItemClick(subItem, index, subIndex)}
                            className={`relative block px-4 py-2 text-sm 
                            ${isSubActive ? "bg-purple-800 text-white" : "text-gray-300 hover:bg-purple-900 hover:text-white"} 
                            cursor-pointer transition-colors`}
                          >
                            {subItem.label}
                            
                            {/* Add a highlight indicator for active subitem */}
                            {isSubActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    );
  }

  // Mobile Bottom Navigation
  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 ${bgColor || "bg-primary"} border-t border-gray-800 shadow-lg`}>
        <div className="flex justify-between items-center px-2 py-1">
          <div className="flex items-center p-2">
            <img
              src="/images/logoOnly.png"
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          
          {/* Show up to 4 main menu items in the bottom bar */}
          <div className="flex justify-center flex-1">
            {menuItems.slice(0, 4).map((item, index) => {
              const Icon = item.icon;
              const active = isItemActive(index);
              
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item, index)}
                  className={`relative flex flex-col items-center justify-center p-2 mx-1 rounded-lg
                  ${active ? "text-purple-400" : "text-gray-400"}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                  
                  {/* Active indicator for mobile bottom bar */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-400 rounded-t-full"></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Menu toggle button */}
          <button
            onClick={handleToggleSidebar}
            className="p-2 hover:bg-purple-900 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Full Menu (shows when toggled) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-30 backdrop-blur-sm flex justify-center items-end pb-16">
          <div className={`w-full max-w-md mx-auto rounded-t-xl ${bgColor || "bg-primary"} shadow-xl`}>
            <div className="flex justify-center py-1">
              <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto">
              <ul className="p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const active = isItemActive(index);

                  return (
                    <li key={index} className="rounded-lg overflow-hidden">
                      <div
                        role="button"
                        onClick={() => handleItemClick(item, index)}
                        className={`relative flex items-center justify-between p-3 cursor-pointer 
                        ${active ? "bg-purple-900/50 text-purple-300" : "text-gray-300"} 
                        hover:bg-purple-900/30 transition-all`}
                      >
                        <div className="flex items-center">
                          <Icon className={`w-6 h-6 min-w-6 mr-3 ${active ? "text-purple-400" : ""}`} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        
                        {hasSubItems && (
                          <ChevronUp 
                            className={`w-5 h-5 transition-transform ${hoveredItem === index ? "rotate-0" : "rotate-180"}`} 
                          />
                        )}
                        
                        {/* Active indicator for mobile menu */}
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
                        )}
                      </div>

                      {hasSubItems && hoveredItem === index && (
                        <div className="bg-purple-950/80 py-1 pl-10 border-l-2 border-purple-600">
                          {item.subItems?.map((subItem, subIndex) => {
                            const isSubActive = isSubItemActive(index, subIndex);
                            
                            return (
                              <div
                                key={subIndex}
                                role="button"
                                onClick={() => handleSubItemClick(subItem, index, subIndex)}
                                className={`relative block py-2 px-2 text-sm 
                                ${isSubActive ? "text-purple-300 bg-purple-900/30" : "text-gray-300"} 
                                hover:text-white transition-colors`}
                              >
                                {subItem.label}
                                
                                {/* Active indicator for submenu */}
                                {isSubActive && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;