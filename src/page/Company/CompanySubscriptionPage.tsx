import getCompanyMenuItems from '@/app/data/companySidebarItems';
import { RootState } from '@/app/redux/store';
import LoadingScreen from '@/components/Loading/Loading';
import Sidebar from '@/components/Sidebar/Sidebar';
import axiosInstance from '@/services/api/userInstance';
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Plan } from '@/components/Subscriptions/Subscription';
import Subscription from '@/components/Subscriptions/Subscription';

const CompanySubscriptionPage = () => {
    const [plans , setPlans] = useState<Plan[]>()
    useEffect(() => {
        const fetchApplicationDetails = async () => {
            const response = await axiosInstance.get(`/plan`);
            console.log(response.data);
            setPlans(response.data);
        }
        fetchApplicationDetails();
    },[])
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    const [isExpanded, setIsExpanded] = useState(true);
    const { company, loading } = useSelector((state: RootState) => state.companyAuth);
    const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);
        return (
             <>
                {loading && <LoadingScreen />}
                <div className="flex bg-primary min-h-screen">
                    <Sidebar menuItems={companySidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                    <div className="flex-1 flex justify-center p-4 z-2">
                    {plans && <Subscription plans={plans}/>}
                    </div>
                </div>
            </>
        )
}

export default CompanySubscriptionPage
