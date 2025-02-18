import React from 'react';
import { X } from 'lucide-react';

// Define job interface for type safety
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  isOnsite: boolean;
  logoUrl: string;
}

const JobList: React.FC = () => {
  // Mock data - replace with actual data source
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Job Title In Detail Lorem Ipsum',
      company: 'Job providing company name.',
      location: 'Bangluru, Karnataka, India',
      isOnsite: true,
      logoUrl: '/profile-placeholder.png'
    },
    {
      id: '2',
      title: 'Job Title In Detail Lorem Ipsum',
      company: 'Job providing company name.',
      location: 'Bangluru, Karnataka, India',
      isOnsite: true,
      logoUrl: '/profile-placeholder.png'
    },
    {
      id: '3',
      title: 'Job Title In Detail Lorem Ipsum',
      company: 'Job providing company name.',
      location: 'Bangluru, Karnataka, India',
      isOnsite: true,
      logoUrl: '/profile-placeholder.png'
    }
  ];

  return (
    <div className="bg-secondary p-6 rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Jobs picks for you</h2>
        <p className="text-gray-300 text-sm">Based on your profile and preferences</p>
      </div>

      <div className="space-y-4 mb-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-purple-900 rounded-lg p-4 flex items-center gap-4 relative">
            {/* Company logo - circular with yellow background */}
            <div className="shrink-0">
              <div className="w-16 h-16 bg-yellow-300 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src=''
                  alt={''}
                  className="w-14 h-14 object-cover"
                  
                />
              </div>
            </div>

            {/* Job details */}
            <div className="flex-grow">
              <h3 className="font-semibold text-white">{job.title}</h3>
              <p className="text-gray-300 text-sm">{job.company}</p>
              <p className="text-gray-400 text-sm mt-1">
                {job.location} {job.isOnsite ? '(On-site)' : '(Remote)'}
              </p>
            </div>

            {/* Close button */}
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Show all button */}
      <div className="flex justify-center">
        <button className="border border-gray-600 text-gray-200 py-2 px-6 rounded-md hover:bg-purple-900 transition-colors text-sm">
          Show All
        </button>
      </div>
    </div>
  );
};

export default JobList;