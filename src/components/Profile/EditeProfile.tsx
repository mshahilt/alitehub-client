import React, { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  contact: {
    phone: string | null;
  };
  profile_picture: string | null;
  job_types: string[];
  industries: string[];
  locations: string[];
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (userData: UserProfile) => void;
}

const EditeProfile: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [userData, setUserData] = useState<UserProfile>(user);
  const [activeTab, setActiveTab] = useState('basic');

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

//   const handleArrayInput = (field: string, value: string) => {
//     // if (value.trim() && !userData[field].includes(value.trim())) {
//     //   setUserData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
//     // }
//   };

//   const removeArrayItem = (field: string, index: number) => {
//     setUserData(prev => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index)
//     }));
//   };

  const addEducation = () => {
    setUserData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: ''
      }]
    }));
  };

  const addExperience = () => {
    setUserData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#240750] w-full max-w-6xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#12012C]">
          <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Tabs */}
          <div className="w-48 bg-[#12012C] p-4">
            <nav className="space-y-2">
              {['basic', 'skills', 'education', 'experience'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    activeTab === tab 
                      ? 'bg-[#240750] text-white' 
                      : 'text-gray-400 hover:bg-[#240750]/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative w-32 h-32 rounded-full bg-[#12012C] flex items-center justify-center">
                    {userData.profile_picture ? (
                      <img 
                        src={userData.profile_picture} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Upload className="text-gray-400" size={32} />
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <input
                      type="text"
                      value={userData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className="w-full p-2 rounded bg-[#12012C] text-white border border-gray-700"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={userData.username}
                      onChange={e => handleInputChange('username', e.target.value)}
                      className="w-full p-2 rounded bg-[#12012C] text-white border border-gray-700"
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    value={userData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="p-2 rounded bg-[#12012C] text-white border border-gray-700"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    value={userData.contact.phone || ''}
                    onChange={e => handleInputChange('contact', { phone: e.target.value })}
                    className="p-2 rounded bg-[#12012C] text-white border border-gray-700"
                    placeholder="Phone"
                  />
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                {['skills', 'job_types', 'industries', 'locations'].map(field => (
                  <div key={field} className="space-y-2">
                    <label className="text-white capitalize">{field.replace('_', ' ')}</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {userData[field].map((item, index) => (
                        <span 
                          key={index}
                          className="bg-[#12012C] text-white px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {item}
                          <button 
                            onClick={() => removeArrayItem(field, index)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 rounded bg-[#12012C] text-white border border-gray-700"
                        placeholder={`Add ${field.replace('_', ' ')}`}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            handleArrayInput(field, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            <div className="absolute bottom-6 right-6">
              <button
                onClick={() => onSave(userData)}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditeProfile;