import { useEffect, useState } from "react";
import adminAxiosInstance from "../../services/api/adminInstance";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminMenuItems from "../../app/data/adminSidebarItems";
import GenericTable from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";

const CompanyManagement = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [companies, setCompanies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await adminAxiosInstance.get('/getCompanies');
                console.log(response.data)
                setCompanies(response.data.companies);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        fetchCompanies();
    }, []);

    interface Company {
        _id: string;
        name: string;
        email: string;
        industry: string;
        companyType: string;
    }

    interface Column {
        key: string;
        label: string;
        render?: (row: Company) => JSX.Element;
    }

    const columns: Column[] = [
        { key: "name", label: "Company Name" },
        { key: "email", label: "Email" },
        { key: "industry", label: "Industry" },
        { key: "companyType", label: "Type" },
        { key: "actions", label: "Actions", render: (row: Company) => (
            <button 
                onClick={() => navigate(`/admin/company/${row._id}`)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
                Show Details
            </button>
        ) },
    ];

    return (
        <div className="flex bg-black min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="bg-black" 
            />
            <div className="flex-1 bg-black min-h-screen flex justify-center p-4 z-2">
                <div className="w-full bg-black max-w-6xl">
                    <GenericTable columns={columns} data={companies} bgColor="bg-black"/>
                </div>
            </div>
        </div>
    );
};

export default CompanyManagement;
