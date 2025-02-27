import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  jobTitle: string;
  company: string;
  postedDate: string;
  location: string;
  isOnsite: boolean;
  company_profile: string;
}

interface JobListProps {
  jobs: Job[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
  const navigate = useNavigate();
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [clickedJob, setClickedJob] = useState<string | null>(null);

  const handleJobClick = (jobId: string) => {
    setClickedJob(jobId);
    
    setTimeout(() => {
      navigate(`/jobs/${jobId}`);
    }, 300);
  };

  const handleRemoveClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    console.log(`Remove job ${jobId}`);
  };

  return (
    <div className="bg-secondary p-6 rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Jobs picks for you</h2>
        <p className="text-gray-300 text-sm">Based on your profile and preferences</p>
      </div>

      <div className="space-y-4 mb-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`bg-purple-900 rounded-lg p-4 flex items-center gap-4 relative cursor-pointer transition-all duration-300 ${
              hoveredJob === job.id ? "transform scale-102 shadow-lg" : ""
            } ${
              clickedJob === job.id ? "transform scale-95 opacity-80" : ""
            }`}
            onClick={() => handleJobClick(job.id)}
            onMouseEnter={() => setHoveredJob(job.id)}
            onMouseLeave={() => setHoveredJob(null)}
          >
            <div className="shrink-0">
              <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={job.company_profile} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="font-semibold text-white">{job.jobTitle}</h3>
              <p className="text-gray-300 text-sm">{job.company}</p>
              <p className="text-gray-400 text-sm mt-1">
                {job.location} {job.isOnsite ? "(On-site)" : "(Remote)"}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Posted: {job.postedDate}
              </p>
            </div>

            <div className={`absolute top-0 left-0 w-full h-full bg-purple-700 rounded-lg opacity-0 transition-opacity duration-300 ${
              hoveredJob === job.id ? "opacity-10" : ""
            }`} />

            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-1"
              onClick={(e) => handleRemoveClick(e, job.id)}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button className="border border-gray-600 text-gray-200 py-2 px-6 rounded-md hover:bg-purple-900 transition-colors text-sm">
          Show All
        </button>
      </div>
    </div>
  );
};

export default JobList;