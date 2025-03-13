import { RootState } from '@/app/redux/store';
import LoadingScreen from '@/components/Loading/Loading';
import Sidebar from '@/components/Sidebar/Sidebar';
import axiosInstance from '@/services/api/userInstance';
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ApplicationDetailPage, { Application } from '@/components/company/ApplicationDetail';
import getUserMenuItems from '@/app/data/userSidebarItems';

const UserApplicationDetailPage = () => {
    const [application , setApplication] = useState<Application>()
    const {id} = useParams();
    useEffect(() => {
        const fetchApplicationDetails = async () => {
            const response = await axiosInstance.get(`/application/${id}`);
            console.log(response.data);
            setApplication(response.data);
        }
        fetchApplicationDetails();
    },[id])
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    const [isExpanded, setIsExpanded] = useState(true);
    const { user, loading } = useSelector((state: RootState) => state.userAuth);
    const userSidebarItems = getUserMenuItems(user?.username);
        return (
             <>
                {loading && <LoadingScreen />}
                <div className="flex bg-primary min-h-screen">
                    <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                    <div className="flex-1 flex justify-center p-4 z-2">
                    {application && <ApplicationDetailPage application={application} userType='user'/>}
                    </div>
                </div>
            </>
        )
}

export default UserApplicationDetailPage;
