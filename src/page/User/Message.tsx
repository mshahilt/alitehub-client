import getUserMenuItems from '@/app/data/userSidebarItems';
import { RootState } from '@/app/redux/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '@/components/Sidebar/Sidebar';
import Chat from '@/components/Message/Chat';
import Messages from '@/components/Message/Messages';

const Message = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
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
        <div className='flex bg-primary min-h-screen'>
            {/* Sidebar */}
            <div className={`${isExpanded ? 'w-1/6' : 'w-auto'} h-screen z-20 md:block hidden`}>
                <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            </div>

            {/* Messages container */}
            <div className='flex-1 flex'>
                <div className={`${selectedChat && window.innerWidth < 768 ? 'hidden' : 'block'} w-full md:w-1/3 border-r border-gray-700 bg-gray-900 flex flex-col`}>
                   <Chat/> 
                </div>

                <div className={`${!selectedChat && window.innerWidth < 768 ? 'hidden' : 'block'} w-full md:w-2/3 flex flex-col bg-gray-900`}>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <Messages />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;