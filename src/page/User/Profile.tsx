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
    const { user } = useSelector((state: RootState) => state.userAuth) as { 
      user: { name: string, username: string; email: string  }, 
      loading: boolean,
    };
    const userSidebarItems = getUserMenuItems(user?.username);


      useEffect(() => {
        const handleResize = () => {
          setIsExpanded(window.innerWidth > 1000);
        }
    
        handleResize();
    
        window.addEventListener('resize', handleResize);
      }, []);
    
  return (
    <div className="flex bg-primary min-h-screen">
        <div className="fixed left-0 w-1/4 h-screen z-20">
            <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        </div>
        <div className='fixed right-0 w-1/4 h-screen overflow-y-auto no-scrollbar bg-primary border-l border-gray-800 z-50 pointer-events-auto'>
            <div className="p-4 text-gray-400"><ProfileSidebar/></div>
        </div>
        <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
        <div className="w-full max-w-2xl min-h-screen">
            <ProfileComponent username={username as string}/>
        </div>
      </div>
    </div>
  )
}

export default Profile
