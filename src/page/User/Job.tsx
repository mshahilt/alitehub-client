import Sidebar from "@/components/Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import getUserMenuItems from "@/app/data/userSidebarItems";
import JobDetail from "@/components/UserJob/JobDetail";
import axiosInstance from "@/services/api/userInstance";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface JobListProps {
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

const Job = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [job, setJob] = useState<JobListProps | null>(null);
  const [questions, setQuestion] = useState<{ question: string; type: string; options: string[]; _id: string }[]>([]);
  const [quizId, setQuizId] = useState("");
  const [apply, setApply] = useState(false)
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const handleApplyForJob = () => {
    console.log("fun worked")
    setApply(true)
    console.log(apply)
    }
  const { user } = useSelector((state: RootState) => state.userAuth) as {
    user: { name: string; username: string; email: string };
    loading: boolean;
  };
  const userSidebarItems = getUserMenuItems(user?.username);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axiosInstance.get(`/jobs/${jobId}`);
        console.log("Fetched job:", response.data.job);
        setJob(response.data.job);
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };

    if (jobId) fetchJob();
  }, [jobId]);

  useEffect(() => {
    console.log('apply', apply);
    const handleResize = () => setIsExpanded(window.innerWidth > 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchQuizQuestion = async () => {
      try {
        const response = await axiosInstance.get(`/quiz/${jobId}`);
        console.log('Fetched Quized', response.data.quiz);
        setQuestion(response.data.quiz.questions);
        setQuizId(response.data.quiz.id);
      } catch (error) {
        toast.error("Error fetching job.")
        navigate('/')
        console.error("Error fetching job:", error);
      }
    };
    
    if(jobId) {
      fetchQuizQuestion();
    }
  }, [jobId]);

  return (
    <>
    <div className="flex bg-primary min-h-screen">
      <div className="fixed left-0 w-1/4 h-screen z-20">
        <Sidebar
          menuItems={userSidebarItems}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>

      <div className="fixed right-0 w-1/4 h-screen overflow-y-auto no-scrollbar bg-primary border-l border-gray-800 z-50 pointer-events-auto">
        <div className="p-4 text-gray-400">Right Area</div>
      </div>

      <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
        <div className="w-full max-w-2xl min-h-screen">
          {job ? <JobDetail job={job} handleApply={handleApplyForJob} apply={apply} questions={questions} quizId={quizId}/>: <p className="text-gray-500">Loading job details...</p>}
        </div>
      </div>
    </div>
    </>
  );
};

export default Job;
