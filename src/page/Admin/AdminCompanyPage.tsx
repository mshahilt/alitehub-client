import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import CompanyProfileCard from "@/components/company/CompanyDetail";
import adminMenuItems from "@/app/data/adminSidebarItems";
import { useParams } from "react-router-dom";
import axiosInstance from "@/services/api/userInstance";

const CompanyProfile = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { companyIdentifier } = useParams<{ companyIdentifier: string }>();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get(`/company/${companyIdentifier}`);
        setCompanyData(response.data.user); // Update here to get the `user` object
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    if (companyIdentifier) {
      fetchCompany();
    }
  }, [companyIdentifier]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative flex bg-black min-h-screen">
      <div
        className={`${
          isMobile ? "absolute" : "fixed"
        } left-0 ${isMobile ? "w-full" : "w-1/4"} h-screen z-30`}
      >
        <Sidebar
          bgColor="bg-black"
          menuItems={adminMenuItems}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>

      <div
        className={`relative flex-1 min-h-screen ${
          !isMobile ? "ml-1/4" : "ml-0"
        } ${!isMobile ? "mr-1/4" : "mr-0"} flex justify-center p-1 z-10`}
      >
        <div className="w-full max-w-2xl min-h-screen">
          {loading ? (
            <p className="text-white text-center">Loading...</p>
          ) : companyData ? (
            <CompanyProfileCard companyData={companyData} />
          ) : (
            <p className="text-white text-center">Company not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
