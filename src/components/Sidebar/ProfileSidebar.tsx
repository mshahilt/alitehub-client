import React from 'react';
import { Award, Zap, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';

const ProfileSidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.userAuth);

  return (
    <div className="max-w-4xl mx-auto bg-secondary rounded-xl shadow-lg overflow-hidden transition-all">
      <div className="p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 border-b pb-4 border-gray-700">
          Professional Profile
        </h1>
        
      {/* Skills Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 flex items-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-400" />
              Skills
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {user?.skills?.length > 0 ? (
              user.skills.map((skill, index) => (
                <div key={index} className="bg-black rounded-lg px-4 py-3 transition-all hover:shadow-md hover:bg-opacity-80">
                  <h3 className="font-medium text-gray-200">{skill}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 bg-black rounded-xl">
                No experience added yet
              </p>
            )}
          </div>

        </div>
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 flex items-center">
              <Award className="w-5 h-5 md:w-6 md:h-6 mr-2 text-indigo-400" />
              Education
            </h2>
          </div>
          
          <div className="space-y-4">
            {user?.education?.length > 0 ? (
              user.education.map((elem, index) => (
                <div key={index} className="bg-black p-4 rounded-xl transition-all hover:shadow-md hover:bg-opacity-80">
                  <h3 className="font-semibold text-white">
                    {elem.institution}
                  </h3>
                  <p className="font-medium text-gray-300 mt-1">
                    {elem.degree}
                    {elem.field && <span> • {elem.field}</span>}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {elem.start_date}
                    {elem.end_date && <span> - {elem.end_date}</span>}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 bg-black rounded-xl">
                No education details available
              </p>
            )}
          </div>

        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 flex items-center">
              <Award className="w-5 h-5 md:w-6 md:h-6 mr-2 text-teal-400" />
              Experience
            </h2>
          </div>
          
          <div className="space-y-4">
            {user.experience?.length > 0 ? (
              user.experience.map((elem, index) => (
                <div key={index} className="bg-black p-4 rounded-xl transition-all hover:shadow-md hover:bg-opacity-80">
                  <h3 className="font-semibold text-white">
                    {elem.company}
                  </h3>
                  <p className="font-medium text-gray-300 mt-1">
                    {elem.title}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {elem.start_date}
                    {elem.end_date && <span> - {elem.end_date}</span>}
                  </p>
                  {elem.description && (
                    <p className="text-gray-300 text-sm mt-3 line-clamp-3 hover:line-clamp-none transition-all">
                      {elem.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 bg-black rounded-xl">
                No experience added yet
              </p>
            )}
          </div>
        </div>

        {/* Download Resume Button */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md">
            <FileText className="w-5 h-5 mr-2" />
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;