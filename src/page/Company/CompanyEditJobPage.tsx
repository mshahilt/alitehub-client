import AddJobForm from "@/components/company/AddJobForm";
import Sidebar from "@/components/Sidebar/Sidebar";
import getCompanyMenuItems from "@/app/data/companySidebarItems";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { useParams } from "react-router-dom";

const CompanyEditJobPage = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const {jobId} = useParams();
    
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return() => window.removeEventListener("resize", handleResize);
    }, []);

    const {company} = useSelector((state: RootState) => state.companyAuth);

    const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);
    
  return (
    <div className="flex bg-primary min-h-screen">
      <Sidebar
      menuItems={companySidebarItems}
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
      />
      <div className="flex-1 flex justify-center p-4 z-2">
        <div className="w-full max-w-6xl">
            <AddJobForm usage="edit" jobId={jobId}/>
        </div>
      </div>
    </div>
  )
}

export default CompanyEditJobPage;
