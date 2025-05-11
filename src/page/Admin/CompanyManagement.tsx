import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxiosInstance from "../../services/api/adminInstance";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminMenuItems from "../../app/data/adminSidebarItems";
import GenericTable from "../../components/Table/Table";

interface Company {
    id: string;
    name: string;
    email: string;
    industry: string;
    companyType: string;
    companyIdentifier: string;
    isBlock: boolean;
}

const CompanyManagement = () => {
    const [isExpanded, setIsExpanded] = useState(window.innerWidth > 1000);
    const [companies, setCompanies] = useState<Company[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsExpanded(window.innerWidth > 1000);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const { data } = await adminAxiosInstance.get('/getCompanies');
            setCompanies(Array.isArray(data.companies) ? data.companies : []);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setCompanies([]);
        }
    };

    const handleBlock = async (companyId: string) => {
        try {
            await adminAxiosInstance.patch(`/blockOrUnblockCompany/${companyId}`);
            fetchCompanies();
        } catch (error) {
            console.error("Error blocking/unblocking company:", error);
        }
    };

    const columns: { key: keyof Company; label: string }[] = [
        { key: "name", label: "Company Name" },
        { key: "email", label: "Email" },
        { key: "industry", label: "Industry" },
        { key: "companyType", label: "Type" },
    ];

    return (
        <div className="flex bg-black min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="bg-black" 
            />
            <div className="flex-1 bg-black min-h-screen flex justify-center p-4">
                <div className="w-full bg-black max-w-6xl">
                    <GenericTable
                        columns={columns}
                        data={companies}
                        bgColor="bg-black"
                        actions={(company: Company) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleBlock(company.id)}
                                    className={company.isBlock
                                        ? "rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 w-24" 
                                         : "rounded bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 w-24"
                                     }
                                >
                                    {company.isBlock ? "Unblock" : "Block"}
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/company/${company.companyIdentifier}`)}
                                    className="rounded bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    View Details
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default CompanyManagement;
