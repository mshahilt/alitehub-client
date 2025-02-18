import AddJobForm from "@/components/company/AddJobForm";
import Sidebar from "@/components/Sidebar/Sidebar";
import getCompanyMenuItems from "@/app/data/companySidebarItems";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";

const CompanyAddNewJobPage = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return() => window.removeEventListener("resize", handleResize);
    }, []);

    const {company, loading} = useSelector((state: RootState) => state.companyAuth);

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
            <AddJobForm/>
        </div>
      </div>
    </div>
  )
}

export default CompanyAddNewJobPage
