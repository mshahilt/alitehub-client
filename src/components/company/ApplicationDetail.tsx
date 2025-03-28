import React, { useState } from 'react';
import { 
  CalendarIcon, 
  UserIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  BuildingIcon, 
  CheckIcon, 
  ClockIcon, 
  BookOpenIcon, 
  GraduationCapIcon,
  CalendarDaysIcon
} from 'lucide-react';
import axiosInstance from '@/services/api/userInstance';

interface Applicant {
  _id: string;  
  name: string;
  email: string;
  contact: {
    phone: string;
  };
  username: string;
  skills: string[];
  profile_picture?: string;
  resume_url?: string;
  video_url?: string;
  experience: Array<{
    title: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    start_date: string;
    end_date: string;
  }>;
}

interface JobDetails {
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  jobType: string;
  workplaceType: string;
  yearsExperienceExpecting: number;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
}

export interface Application {
  _id: string;
  userDetails: Applicant;
  jobDetails: JobDetails;
  status: 'pending' | 'approved' | 'rejected';
  quiz_score?: number;
  interviewDetails?: any;
}

interface Interview {
  date: string;
  time: string;
  userId: string;
  applicationId: string;
}

interface ScheduledInterview {
  date: string;
  roomId: string;
  scheduledTime: Date;
  status: string;
}

const ApplicationDetailPage: React.FC<{ application: Application, userType: "company" | "user" }> = ({ application, userType }) => {
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [interviewTime, setInterviewTime] = useState<string>('');
  const [interviewType, setInterviewType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [scheduledInterview, setScheduledInterview] = useState<ScheduledInterview | null>(application.interviewDetails);
  const [notes, setNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  if (!application || !application.userDetails || !application.jobDetails) {
    return <div className="p-8 text-center text-white">Loading application details...</div>;
  }

  const { userDetails, jobDetails, status, quiz_score } = application;
  const applicant = userDetails;
  const isCompany = userType === "company";

  const handleScheduleInterview = async () => {
    if (!isCompany) return;
    
    const combinedDate = new Date(`${interviewDate}T${interviewTime}:00.000Z`);

    const interview: Interview = {
      date: combinedDate.toISOString(),
      userId: applicant._id,
      time: interviewTime,
      applicationId: application._id,
    };

    try {
      const response = await axiosInstance.post('/call/interview', {interview});
      
      if (response.data) {
        const newScheduledInterview: ScheduledInterview = {
          date: response.data.date,
          roomId: response.data.roomId,
          scheduledTime: response.data.scheduledTime,
          status: response.data.status
        };
        setScheduledInterview(newScheduledInterview);
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
    }
  };

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!isCompany) return;
    
    setIsUpdatingStatus(true);
    try {
      await axiosInstance.patch(`/applications/${application._id}`, {
        status: newStatus
      });
      // Update local state to show the change immediately
      application.status = newStatus;
    } catch (error) {
      console.error("Error updating application status:", error);
    }
    setIsUpdatingStatus(false);
  };

  const handleSaveNotes = async () => {
    if (!isCompany) return;
    
    try {
      await axiosInstance.patch(`/applications/${application._id}`, {
        notes: notes
      });
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleJoinInterview = () => {
    if (!scheduledInterview) return;
    if(userType === "user") {
      window.open(`/interview/${scheduledInterview.roomId}`, '_blank');
    } else {
      window.open(`/company/interview/${scheduledInterview.roomId}`, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-secondary min-h-screen p-6 text-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Application Details</h1>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  status === 'approved' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="ml-4 text-gray-300">Application ID: {application._id.substring(0, 8)}</span>
              </div>
            </div>
            {isCompany && (
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-md disabled:opacity-50"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isUpdatingStatus || status === 'approved'}
                >
                  Approve
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isUpdatingStatus || status === 'rejected'}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Applicant Details */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  {applicant.profile_picture ? 
                    <img src={applicant.profile_picture} alt={applicant.name} className="w-full h-full rounded-full object-cover" /> : 
                    <UserIcon size={32} className="text-gray-300" />
                  }
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-white">{applicant.name}</h2>
                  <p className="text-gray-300">{applicant.email}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-start mb-3">
                  <BriefcaseIcon size={20} className="mt-1 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-white">Contact</p>
                    <p className="text-gray-300">{applicant.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-3">
                  <UserIcon size={20} className="mt-1 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-white">Username</p>
                    <p className="text-gray-300">{applicant.username}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mt-6 mb-3 text-white">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Resume and Video */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-white">Application Materials</h3>
              
              {applicant.resume_url && (
                <a 
                  href={applicant.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-700 rounded mb-3 hover:bg-gray-600 transition-colors"
                >
                  <BookOpenIcon size={20} className="text-gray-300 mr-2" />
                  <span className="text-white">View Resume</span>
                </a>
              )}
              
              {applicant.video_url && (
                <a 
                  href={applicant.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                  <BookOpenIcon size={20} className="text-gray-300 mr-2" />
                  <span className="text-white">View Introduction Video</span>
                </a>
              )}
              
              <div className="mt-4">
                <p className="font-medium text-white">Quiz Score</p>
                <p className="text-gray-300">{quiz_score !== undefined ? quiz_score : 'Not taken'}</p>
              </div>
            </div>
          </div>
          
          {/* Middle Column - Job Details and Experience */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4 text-white">Job Details</h3>
              
              <div className="flex items-start mb-3">
                <BriefcaseIcon size={20} className="mt-1 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium text-white">Position</p>
                  <p className="text-gray-300">{jobDetails.jobTitle}</p>
                </div>
              </div>
              
              <div className="flex items-start mb-3">
                <BuildingIcon size={20} className="mt-1 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium text-white">Company</p>
                  <p className="text-gray-300">{jobDetails.companyName}</p>
                </div>
              </div>
              
              <div className="flex items-start mb-3">
                <MapPinIcon size={20} className="mt-1 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p className="text-gray-300">{jobDetails.jobLocation}</p>
                </div>
              </div>
              
              <div className="flex items-start mb-3">
                <ClockIcon size={20} className="mt-1 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium text-white">Job Type</p>
                  <p className="text-gray-300">{jobDetails.jobType} | {jobDetails.workplaceType}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="font-medium text-white">Experience Required</p>
                <p className="text-gray-300">{jobDetails.yearsExperienceExpecting} years</p>
              </div>
              
              <div className="mt-4">
                <p className="font-medium text-white">Description</p>
                <p className="text-gray-300">{jobDetails.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-white">Experience</h3>
              
              {applicant.experience && applicant.experience.map((exp, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-700 last:border-0">
                  <p className="font-medium text-white">{exp.title}</p>
                  <p className="text-gray-300">{exp.company}</p>
                  <p className="text-gray-400 text-sm">{exp.start_date} - {exp.end_date}</p>
                  <p className="text-gray-300 mt-2">{exp.description}</p>
                </div>
              ))}
              
              <h3 className="font-semibold text-lg mt-6 mb-4 text-white">Education</h3>
              
              {applicant.education && applicant.education.map((edu, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-700 last:border-0">
                  <div className="flex items-start">
                    <GraduationCapIcon size={20} className="mt-1 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium text-white">{edu.degree}</p>
                      <p className="text-gray-300">{edu.institution}</p>
                      <p className="text-gray-400 text-sm">{edu.start_date} - {edu.end_date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4 text-white">Job Requirements</h3>
              
              <div className="mb-4">
                <p className="font-medium mb-2 text-white">Responsibilities</p>
                <ul className="list-disc pl-5">
                  {jobDetails.responsibilities.map((item, index) => (
                    <li key={index} className="text-gray-300 mb-1">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <p className="font-medium mb-2 text-white">Qualifications</p>
                <ul className="list-disc pl-5">
                  {jobDetails.qualifications.map((item, index) => (
                    <li key={index} className="text-gray-300 mb-1">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-2 text-white">Required Skills</p>
                <ul className="list-disc pl-5">
                  {jobDetails.skills.map((item, index) => (
                    <li key={index} className="text-gray-300 mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-lg p-6">
              <span className="flex">
                <CalendarIcon />
                <h3 className="font-semibold text-lg mb-4 ml-3 text-white">Interview Details</h3>
              </span>
              
              {scheduledInterview ? (
                <div className="bg-green-800 border border-green-700 rounded p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <CheckIcon size={20} className="text-green-400 mr-2" />
                    <p className="font-medium text-green-300">Interview Scheduled</p>
                  </div>
                  <p className="text-white"><span className="font-medium">Date & Time:</span> {typeof scheduledInterview.scheduledTime === 'string' ? scheduledInterview.scheduledTime : formatDate(scheduledInterview.scheduledTime.toString())}</p>
                  <p className="text-white"><span className="font-medium">Status:</span> {scheduledInterview.status}</p>
                  <p className="text-white"><span className="font-medium">Meet ID:</span> {scheduledInterview.roomId}</p>
                  
                  <div className="mt-4 flex gap-3">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-md"
                      onClick={handleJoinInterview}
                    >
                      Join Interview
                    </button>
                    
                    {isCompany && (
                      <button 
                        className="text-sm text-blue-300 hover:text-blue-200"
                        onClick={() => setScheduledInterview(null)}
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              ) : isCompany ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-white mb-1">Interview Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border bg-gray-700 border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-white mb-1">Interview Time</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2 border bg-gray-700 border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-white mb-1">Interview Type</label>
                    <select 
                      className="w-full px-3 py-2 border bg-gray-700 border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as 'video' | 'phone' | 'in-person')}
                    >
                      <option value="video">Video Interview</option>
                      <option value="phone">Phone Interview</option>
                      <option value="in-person">In-Person Interview</option>
                    </select>
                  </div>
                  
                  <button 
                    className="w-full bg-black text-white py-2 rounded cursor-pointer hover:bg-gray-700 transition-colors shadow-md"
                    onClick={handleScheduleInterview}
                    disabled={!interviewDate || !interviewTime}
                  >
                    Schedule Interview
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-800 rounded">
                  <div className="flex items-center">
                    <CalendarDaysIcon size={20} className="text-gray-400 mr-2" />
                    <p className="text-gray-300">No interview scheduled yet</p>
                  </div>
                </div>
              )}
              
              {isCompany && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2 text-white">Notes</h4>
                  <textarea 
                    className="w-full px-3 py-2 border bg-gray-700 border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-white"
                    placeholder="Add private notes about this applicant..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button 
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-md"
                    onClick={handleSaveNotes}
                  >
                    Save Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;