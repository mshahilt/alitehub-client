import getUserMenuItems from '@/app/data/userSidebarItems';
import { RootState } from '@/app/redux/store';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ApplicationList from '@/components/UserApplications/ApplicationList';
import axiosInstance from '@/services/api/userInstance';

const Application = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [applications, setApplications] = useState<any[]>([]);  

    const { user } = useSelector((state: RootState) => state.userAuth) as { 
        user: { name: string, username: string; email: string }, 
        loading: boolean,
    };
    const userSidebarItems = getUserMenuItems(user?.username);

    useEffect(() => {
        const fetchJobApplications = async () => {
            try {
                const response = await axiosInstance.get('/application/user');
                console.log("Fetched applications:", response.data);
                setApplications(response.data.applications);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobApplications();
    }, []); 

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
                    Right Area
                </div>
            </div>
            
            <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
                <div className="w-full max-w-2xl min-h-screen">
                 <ApplicationList applications={applications}/> 
                </div>
            </div>
        </div>
    );
};

export default Application;
