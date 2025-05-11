import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Sidebar from "@/components/Sidebar/Sidebar";
import CompanyProfileCard from "@/components/company/CompanyDetail";
import getUserMenuItems from "@/app/data/userSidebarItems";
import axiosInstance from "@/services/api/userInstance";
import { RootState } from "@/app/redux/store";

const CompanyDetailsPage = () => {
  const { companyIdentifier } = useParams<{ companyIdentifier: string }>();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const { user } = useSelector((state: RootState) => state.userAuth);
  const userSidebarItems = getUserMenuItems(user?.username);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get(`/company/${companyIdentifier}`);
        setCompanyData(response.data.user);
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
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative flex bg-black min-h-screen">
      {/* Sidebar */}
      <div
        className={`${
          isMobile ? "absolute" : "fixed"
        } left-0 ${isMobile ? "w-full" : "w-1/4"} h-screen z-30`}
      >
        <Sidebar
          bgColor="bg-black"
          menuItems={userSidebarItems}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>

      {/* Main Content */}
      <div
        className={`relative flex-1 min-h-screen ${
          !isMobile ? "ml-1/4" : "ml-0"
        } flex justify-center p-1 z-10`}
      >
        <div className="w-full max-w-2xl min-h-screen">
          {loading ? (
            <p className="text-white text-center mt-10">Loading...</p>
          ) : companyData ? (
            <CompanyProfileCard companyData={companyData} />
          ) : (
            <p className="text-white text-center mt-10">Company not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
