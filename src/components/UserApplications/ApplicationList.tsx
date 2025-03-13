import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Application {
  _id: string;
  status: string;
  quiz_score: number;
  jobDetails?: {
    _id: string;
    jobTitle: string;
    companyName: string;
    jobLocation: string;
    workplaceType: string;
    jobType: string;
    createdAt: string;
  };
}

interface ApplicationListProps {
  applications?: Application[] | null;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications }) => {
  const navigate = useNavigate();
  const [hoveredApplication, setHoveredApplication] = useState<string | null>(null);
  const [clickedApplication, setClickedApplication] = useState<string | null>(null);

  const handleApplicationClick = (applicationId: string) => {
    setClickedApplication(applicationId);
    setTimeout(() => {
      navigate(`/application/${applicationId}`);
    }, 300);
  };

  const handleRemoveClick = (e: React.MouseEvent, applicationId: string) => {
    e.stopPropagation();
    console.log(`Remove application ${applicationId}`);
  };

  return (
    <div className="bg-secondary p-6 rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Your Applications</h2>
        <p className="text-gray-300 text-sm">Track the status of your job applications</p>
      </div>
      
      {applications && applications.length > 0 ? (
        <div className="space-y-4 mb-6">
          {applications.map((application) => (
            <div
              key={application._id}
              className={`bg-purple-900 rounded-lg p-4 flex items-center gap-4 relative cursor-pointer transition-all duration-300 ${
                hoveredApplication === application._id ? "transform hover:scale-[1.02] shadow-lg" : ""
              } ${clickedApplication === application._id ? "transform scale-95 opacity-80" : ""}`}
              onClick={() => handleApplicationClick(application._id)}
              onMouseEnter={() => setHoveredApplication(application._id)}
              onMouseLeave={() => setHoveredApplication(null)}
            >
              <div className="flex-grow">
                <h3 className="font-semibold text-white">
                  {application.jobDetails?.jobTitle || "Unknown Job Title"}
                </h3>
                <p className="text-gray-300 text-sm">
                  {application.jobDetails?.companyName || "Unknown Company"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {application.jobDetails?.jobLocation || "Unknown Location"} ({application.jobDetails?.workplaceType || "Unknown"})
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Type: {application.jobDetails?.jobType || "N/A"} | Applied:{" "}
                  {application.jobDetails?.createdAt ? new Date(application.jobDetails.createdAt).toLocaleDateString() : "N/A"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    application.status === "pending" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Quiz Score: {application.quiz_score}%
                  </span>
                </div>
              </div>

              <div
                className={`absolute top-0 left-0 w-full h-full bg-purple-700 rounded-lg opacity-0 transition-opacity duration-300 ${
                  hoveredApplication === application._id ? "opacity-10" : ""
                }`}
              />

              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-1"
                onClick={(e) => handleRemoveClick(e, application._id)}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-6">No applications found.</div>
      )}

      <div className="flex justify-center">
        <button className="border border-gray-600 text-gray-200 py-2 px-6 rounded-md hover:bg-purple-900 transition-colors text-sm">
          Show All
        </button>
      </div>
    </div>
  );
};

export default ApplicationList;