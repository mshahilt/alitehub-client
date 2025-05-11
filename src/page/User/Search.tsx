import { useEffect, useState } from "react";
import getUserMenuItems from "@/app/data/userSidebarItems";
import { RootState } from "@/app/redux/store";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import SearchC from "@/components/Search/SearchC";

const Search = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { existingUser } = useSelector((state: RootState) => state.userAuth);
  const userSidebarItems = getUserMenuItems(existingUser?.username);

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex bg-primary min-h-screen">
      <div className="fixed top-0 left-0 h-screen z-20" style={{ width: isExpanded ? "16.666667%" : "auto" }}>
        <Sidebar 
          menuItems={userSidebarItems} 
          isExpanded={isExpanded} 
          setIsExpanded={setIsExpanded} 
        />
      </div>
      
      <div className="invisible" style={{ width: isExpanded ? "16.666667%" : "auto" }}></div>
      
      <div className="flex-1 min-h-screen flex justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-7xl">
          <SearchC />
        </div>
      </div>
    </div>
  );
};

export default Search;