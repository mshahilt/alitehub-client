import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, getMe } from "../../app/redux/slices/user/userAuthSlice";
import { RootState, AppDispatch } from "../../app/redux/store";
import Sidebar from "../../components/Sidebar/Sidebar";
import PostCard from "../../components/Posts/PostCard";
import getUserMenuItems from "../../app/data/userSidebarItems";
import ProfileSidebar from "@/components/Sidebar/ProfileSidebar";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { existingUser } = useSelector((state: RootState) => state.userAuth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (existingUser?.username) {
      console.log("to check profile picture", existingUser.username);
      dispatch(fetchUserProfile(existingUser.username));
    }
  }, [dispatch, existingUser?.username]);

  const userSidebarItems = getUserMenuItems(existingUser?.username || "");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative flex bg-primary min-h-screen">
      <div className={`${isMobile ? 'absolute' : 'fixed'} left-0 ${isMobile ? 'w-full' : 'w-1/4'} h-screen z-30`}>
        <Sidebar 
          menuItems={userSidebarItems} 
          isExpanded={isExpanded} 
          setIsExpanded={setIsExpanded} 
        />
      </div>

      <div className={`relative flex-1 min-h-screen ${!isMobile ? 'ml-1/4' : 'ml-0'} ${!isMobile ? 'mr-1/4' : 'mr-0'} flex justify-center p-1 z-10`}>
        <div className="w-full max-w-2xl min-h-screen">
          <PostCard />
        </div>
      </div>

      {!isMobile && (
        <div className="fixed right-0 w-1/4 h-screen overflow-y-auto no-scrollbar bg-primary border-l border-gray-800 z-20">
          <div className="p-4 text-gray-400">
            <ProfileSidebar />
          </div>
        </div>
      )}

      {isMobile && (
        <div className="z-40">
          <ProfileSidebar />
        </div>
      )}
    </div>
  );
};

export default Home;