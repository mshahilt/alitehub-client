import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GenericTable from "@/components/Table/Table";
import Sidebar from "@/components/Sidebar/Sidebar";
import getCompanyMenuItems from "@/app/data/companySidebarItems";
import LoadingScreen from "@/components/Loading/Loading";
import axiosInstance from "@/services/api/userInstance";
import { RootState } from "@/app/redux/store";
import { useNavigate } from "react-router-dom";

interface JobApplication {
    id: string;
    user_name: string;
    job_title: string;
    status: string;
    quiz_score: number;
}

const CompanyApplicationsPage = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const { company, loading } = useSelector((state: RootState) => state.companyAuth);
    const navigate = useNavigate();

    const fetchJobApplications = async () => {
        try {
            const response = await axiosInstance.get("/application/company");
            const mappedApplications: JobApplication[] = response.data.applications.map((app: any) => ({
                id: app._id,
                user_name: app.userDetails?.[0]?.name || "Unknown",
                job_title: app.jobDetails?.jobTitle || "Unknown Job",
                status: app.status,
                quiz_score: app.quiz_score ?? 0
            }));
            setApplications(mappedApplications);
        } catch (error) {
            console.error("Error fetching applications:", error);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchJobApplications();
    }, []);

    const handleViewDetails = (id: string) => {
       navigate(`/company/application/${id}`)
    };

    const columns: { key: keyof JobApplication; label: string }[] = [
        { key: "user_name", label: "Applicant Name" },
        { key: "job_title", label: "Job Title" },
        { key: "status", label: "Status" },
        { key: "quiz_score", label: "Quiz Score" }
    ];

    const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);

    return (
        <>
            {loading && <LoadingScreen />}
            <div className="flex bg-primary min-h-screen">
                <Sidebar menuItems={companySidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                <div className="flex-1 flex justify-center p-4 z-2">
                    <div className="w-full max-w-6xl">
                        <GenericTable 
                            columns={columns} 
                            data={applications} 
                            actions={(application: JobApplication) => (
                                <button
                                    onClick={() => handleViewDetails(application.id)}
                                    className="rounded bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    View Details
                                </button>
                            )}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompanyApplicationsPage;