import getCompanyMenuItems from '@/app/data/companySidebarItems';
import { RootState } from '@/app/redux/store';
import Sidebar from '@/components/Sidebar/Sidebar';
import axiosInstance from '@/services/api/userInstance';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plan } from '@/components/Subscriptions/Subscription';
import Subscription from '@/components/Subscriptions/Subscription';

const CompanySubscriptionPage = () => {
    const [plans, setPlans] = useState<Plan[] | []>([]);
    const [subscribedPlans, setSubscribedplans] = useState<{ stripePriceId: string; status: string } | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                const response = await axiosInstance.get(`/plan`);
                console.log("Plans API Response:", response.data);
                setPlans(response.data);
            } catch (error) {
                console.error("Error fetching plans:", error);
            }
        };
        fetchApplicationDetails();
    }, []);

    useEffect(() => {
        const fetchSubscribedPlans = async () => {
            try {
                const response = await axiosInstance.get(`/plan/company`);
                console.log("Subscribed Plans API Response:", response.data);
                setSubscribedplans({
                    stripePriceId: response.data.stripePriceId,
                    status: response.data.status,
                });
            } catch (error) {
                console.error("Error fetching subscribed plans:", error);
            }
        };
        fetchSubscribedPlans();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { company } = useSelector((state: RootState) => state.companyAuth);
    const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);


    return (
        <>
            <div className="flex bg-primary min-h-screen">
                <Sidebar menuItems={companySidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                <div className="flex-1 flex justify-center p-4 z-2">
                    <Subscription plans={plans} subscribedPlans={subscribedPlans} />
                </div>
            </div>
        </>
    );
};

export default CompanySubscriptionPage;