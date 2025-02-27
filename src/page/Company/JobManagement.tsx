import GenericTable from "@/components/Table/Table";
import Sidebar from "@/components/Sidebar/Sidebar";
import getCompanyMenuItems from "@/app/data/companySidebarItems";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import LoadingScreen from "@/components/Loading/Loading";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/services/api/userInstance";
import { getCompany } from "@/app/redux/slices/company/companyAuthSlice";

interface Job {
    id: string;
    jobTitle: string;
    status: string;
    application_recieved: string;
    postedDate: Date;
}


const JobManagement = () => {
    const[isExpanded, setIsExpanded] = useState(true);
    const[jobs, setJobs] = useState<Job[]>([]);
    const {company, loading} = useSelector((state: RootState) => state.companyAuth);

    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(getCompany());
      }, [dispatch]); 
    const fetchJobs = async () =>{
        try {
            const response = await axiosInstance.get('/company/job/get');
            console.log("jhsdkjfh",response.data);
            const formattedJobs = response.data.jobs.map((job: any) => ({
                id: job.id,
                jobTitle: job.jobTitle,
                status: 0,
                application_recieved: 0,
                postedDate: new Date(job.postedDate).toLocaleDateString()
            }));
            setJobs(formattedJobs);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }


    const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchJobs();
    }, []);


    const navigate = useNavigate();

    const handJobBtnClick = () => {
        navigate('/company/jobs/add')
    }
    const columns: {key: keyof Job; label: string}[] = [
        {key: "jobTitle", label: "Job Title"},
        {key: "application_recieved", label: "Application Recieved"},
        {key: "postedDate", label: "Posted Date"},
        {key: "status", label: "Status"}
    ];

    return (
        <>
        {loading && <LoadingScreen/>}
        <div className="flex bg-primary min-h-screen">
            <Sidebar
                menuItems={companySidebarItems}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <div className="flex-1 flex justify-center p-4 z-2">
                <div className="w-full max-w-6xl">
                    <GenericTable columns={columns} data={jobs}/>
                    <Button className="bg-secondary hover:bg-foreground cursor-pointer" onClick={handJobBtnClick}>Add new Job</Button>
                </div>
            </div>
        </div>
        </>
    )
}

export default JobManagement
