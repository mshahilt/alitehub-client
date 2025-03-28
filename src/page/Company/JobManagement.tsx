import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "@/app/redux/store";
import { getCompany } from "@/app/redux/slices/company/companyAuthSlice";
import axiosInstance from "@/services/api/userInstance";
import getCompanyMenuItems from "@/app/data/companySidebarItems";
import Sidebar from "@/components/Sidebar/Sidebar";
import GenericTable from "@/components/Table/Table";
import LoadingScreen from "@/components/Loading/Loading";
import { Button } from "@/components/ui/button";
import JobDetail from "@/components/UserJob/JobDetail";
import { toast } from "sonner";

interface Job {
  id: string;
  jobTitle: string;
  status: string;
  applicationReceived: number;
  postedDate: string;
}

interface DetailedJob {
  id: string;
  jobTitle: string;
  company: string;
  postedDate: string;
  location: string;
  isOnsite: boolean;
  company_profile: string;
  workplaceType: string;
  jobType: string;
  jobLocation: string;
  description: string;
  yearsExperienceExpecting: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
}

interface SubscriptionDetails {
  _id: string;
  companyId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

const JobManagement = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<DetailedJob | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState<{ question: string; type: string; options: string[]; _id: string }[]>([]);
  const [quizId, setQuizId] = useState("");
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  
  const { company, loading } = useSelector((state: RootState) => state.companyAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(getCompany());
        await fetchJobs();
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast("Failed to load company and job information");
      }
    };

    fetchInitialData();
  }, [dispatch]);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get("/company/job/get");
      const formattedJobs = response.data.jobs.jobs.map((job: any) => ({
        id: job.id,
        jobTitle: job.jobTitle,
        status: "Active",
        applicationReceived: job.applicationReceived || 0,
        postedDate: new Date(job.postedDate).toLocaleDateString(),
      }));
      
      setJobs(formattedJobs);
      setSubscriptionDetails(response.data.jobs.subscriptionDetails || null);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      const response = await axiosInstance.get(`/job/${jobId}`);
      setSelectedJob(response.data.job);
      setQuestions(response.data.questions || []);
      setQuizId(response.data.quizId || "");
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to fetch job details");
    }
  };

  const handleResize = () => {
    setIsExpanded(window.innerWidth > 1000);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddJob = () => {
    const maxJobsAllowed = 5;
    const currentJobCount = jobs.length;

    if (currentJobCount >= maxJobsAllowed) {
      if (subscriptionDetails?.status !== "active") {
        toast("You've reached the maximum number of jobs. Please upgrade your subscription.");
        navigate("/company/plans");
        return;
      }
    }
    navigate("/company/jobs/add");
  };

  const handleJobView = (id: string) => {
    fetchJobDetails(id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const columns: { key: keyof Job; label: string }[] = [
    { key: "jobTitle", label: "Job Title" },
    { key: "applicationReceived", label: "Applications Received" },
    { key: "postedDate", label: "Posted Date" },
    { key: "status", label: "Status" },
  ];

  const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);

  const getButtonText = () => {
    const maxJobsAllowed = 5;
    const currentJobCount = jobs.length;

    if (currentJobCount >= maxJobsAllowed) {
      return subscriptionDetails?.status === "active" 
        ? "Add New Job" 
        : "Subscribe Now";
    }
    return "Add New Job";
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="flex bg-primary min-h-screen">
        <Sidebar menuItems={companySidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <div className="flex-1 flex flex-col items-center p-4">
          <div className="w-full max-w-6xl">
            <Button 
              className="mb-4 bg-secondary hover:bg-foreground" 
              onClick={handleAddJob}
            >
              {getButtonText()}
            </Button>
            <GenericTable
              columns={columns}
              data={jobs}
              actions={(job) => (
                <Button 
                  onClick={() => handleJobView(job.id)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded"
                >
                  View Details
                </Button>
              )}
            />
          </div>
        </div>
      </div>

      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl bg-primary rounded-lg shadow-lg">
            <button 
              className="absolute right-2 top-2 text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <JobDetail
              usage="company"
              job={selectedJob} 
              handleApply={() => {}} 
              apply={false} 
              questions={questions} 
              quizId={quizId} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default JobManagement;