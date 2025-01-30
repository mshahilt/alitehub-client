import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import ProfileComponent from "../../components/Profile/Profile";

const Profile = () => {
    const [isExpanded, setIsExpanded] = useState(true);
      
      useEffect(() => {
        const handleResize = () => {
          setIsExpanded(window.innerWidth > 1000);
        }
    
        handleResize();
    
        window.addEventListener('resize', handleResize);
      }, []);
    
  return (
    <div className="flex bg-primary min-h-screen">
        <div className="fixed left-0 w-1/4 h-screen md:block x-3">
            <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        </div>
        <div className='fixed right-0 w-1/4 h-screen bg-primary border-gray-800 lg:block hidden'>
            <div className="p-4 text-gray-400">Right Area</div>
        </div>
        <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
        <div className="w-full max-w-2xl min-h-screen">
            <ProfileComponent/>
        </div>
      </div>
    </div>
  )
}

export default Profile
