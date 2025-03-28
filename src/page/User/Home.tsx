import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../app/redux/slices/user/userAuthSlice";
import { RootState, AppDispatch } from "../../app/redux/store";
import Sidebar from "../../components/Sidebar/Sidebar";
import PostCard from "../../components/Posts/PostCard";
import getUserMenuItems from "../../app/data/userSidebarItems";
import ProfileSidebar from "@/components/Sidebar/ProfileSidebar";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(true);

  const { existingUser } = useSelector((state: RootState) => state.userAuth)

  useEffect(() => {
   dispatch(getMe());
  }, [dispatch]);

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
      <div className="fixed left-0 w-1/4 h-screen z-20">
        <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </div>

      <div className="fixed right-0 w-1/4 h-screen overflow-y-auto no-scrollbar bg-primary border-l border-gray-800 z-50 pointer-events-auto">
        <div className="p-4 text-gray-400">
          <ProfileSidebar/> 
        </div>
      </div>
      <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
        <div className="w-full max-w-2xl min-h-screen">
          <PostCard />
        </div>
      </div>
    </div>
  );
};

export default Home;
