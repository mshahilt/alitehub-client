import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ProfileComponent from "../../components/Profile/Profile";
import { useParams } from "react-router-dom";
import { RootState } from '../../app/redux/store';
import getUserMenuItems from "../../app/data/userSidebarItems";
import { useSelector } from "react-redux";
import ProfileSidebar from "@/components/Sidebar/ProfileSidebar";

const Profile = () => {

    const [isExpanded, setIsExpanded] = useState(true);
    const { username } = useParams(); 
    const [isMobile, setIsMobile] = useState(false);
    const { existingUser } = useSelector((state: RootState) => state.userAuth)
    const userSidebarItems = getUserMenuItems(existingUser?.username);


      useEffect(() => {
        const handleResize = () => {
          const mobile = window.innerWidth < 768;
          setIsMobile(mobile);
          setIsExpanded(window.innerWidth > 1000);
        }
    
        handleResize();
    
        window.addEventListener('resize', handleResize);
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
        <ProfileComponent username={username as string}/>
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
}

export default Profile
