import { User } from "lucide-react";
import QuizComponent from "./QuizComponent";
import { useNavigate } from "react-router-dom";

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

const JobDetail: React.FC<{ job: JobListProps, handleApply: any, apply: boolean, questions: { question: string; type: string; options: string[]; _id: string }[], quizId: string, usage: "user" | "company" }> = ({ job, handleApply, apply, questions, quizId, usage }) => {
    const navigate = useNavigate();
    console.log("usage", usage);
    const handleEditJob = () => {
        navigate(`/company/job/edit/${job.id}`);
    }
    return (
      <>
       {apply && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className=" backdrop-blur-sm rounded-lg shadow-lg p-6 w-[80%] max-w-2xl mx-auto">
            {questions ? (
              <QuizComponent questions={questions.map(q => q.question)} jobId={job.id} quizId={quizId}/>
            ) : (
              <p className="text-gray-500">Loading job details...</p>
            )}
          </div>
        </div>
        )}

        <div className="bg-gray-900 text-white min-h-screen p-6 max-w-full mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 mb-8 text-center md:text-left">
              <div className="bg-yellow-400 rounded-full h-12 w-12 flex items-center justify-center">
                <User className="text-gray-900" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">{job.company}</h1>
                <h2 className="text-xl text-gray-600 font-bold">{job.jobTitle}</h2>
              </div>
            </div>


            <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3">{job.jobLocation} ({job.workplaceType})</p>
                <div className="flex gap-2">
                    {job.skills.map((skill, index) => (
                        <button key={index} className="bg-gray-800 text-xs px-3 py-1 rounded-full border border-gray-700">
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">About The Job</h2>
                <p className="text-sm text-gray-300 mb-4">{job.description}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">Job Responsibilities</h2>
                <ul className="text-sm text-gray-300 list-disc pl-5 space-y-2">
                    {job.responsibilities.map((res, index) => (
                        <li key={index}>{res}</li>
                    ))}
                </ul>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-bold mb-2">Apply For This Role</h2>
                <p className="text-sm text-gray-300 mb-2">
                    Complete a Quick Test Before Applying <span className="font-bold">Start Test</span>
                </p>
                <ul className="text-sm text-gray-300 list-disc pl-5 space-y-2 mb-4">
                    <li>Test should contain questions to understand your skills.</li>
                    <li>Filtering process is based on this test</li>
                </ul>
                {usage === "user" ? (
                    <button className="bg-green-600 text-xs text-white px-4 py-2 rounded-full" onClick={handleApply}>
                        Start Test
                    </button>
                ) : (
                    <button className="bg-green-600 text-xs text-white px-4 py-2 rounded-full" onClick={handleEditJob}>
                        Edit Job
                    </button>
                )}
                
            </div>

            <div className="border-t border-gray-700 pt-6">
                <h2 className="text-lg font-bold mb-4">About The Company</h2>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-yellow-400 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                            <User className="text-gray-900" size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">{job.company}</p>
                            <p className="text-xs text-gray-400">201 followers</p>
                        </div>
                    </div>
                    <button className="border border-gray-400 rounded-full px-3 py-1 text-xs flex items-center">
                        <span className="mr-1">•</span> Follow
                    </button>
                </div>
                <div className="text-sm text-gray-300">
                    <p className="font-bold mb-1">{job.company_profile}</p>
                    <p className="text-xs">
                        Learn more about {job.company} and the opportunities we offer.
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default JobDetail;
