import getUserMenuItems from '@/app/data/userSidebarItems';
import { AppDispatch, RootState } from '@/app/redux/store';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import JobList from '@/components/Table/JobList';
import axiosInstance from '@/services/api/userInstance';

const Jobs = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [isExpanded, setIsExpanded] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);  

    const { user } = useSelector((state: RootState) => state.userAuth) as { 
        user: { name: string, username: string; email: string }, 
        loading: boolean,
    };
    const userSidebarItems = getUserMenuItems(user?.username);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axiosInstance.get('/jobs');
                console.log("Fetched jobs:", response.data.jobs);
                setJobs(response.data.jobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobs();
    }, []);  // Add empty dependency array to fetch once when component mounts

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
                    {/* You can add any extra content here */}
                </div>
            </div>
            
            <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
                <div className="w-full max-w-2xl min-h-screen">
                    {/* Pass the jobs to JobList */}
                    {/* <JobList jobs={jobs} /> */}
                </div>
            </div>
        </div>
    );
};

export default Jobs;
