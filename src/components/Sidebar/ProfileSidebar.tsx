import React, { useState, useRef, useEffect } from 'react';
import { Award, Zap, FileText, User, X, Move } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';

const ProfileSidebar: React.FC = () => {
  const { existingUser, ownAccount, user } = useSelector((state: RootState) => state.userAuth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showMoveHandle, setShowMoveHandle] = useState(false);
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });
  
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const userData = ownAccount ? existingUser : user;
  
  useEffect(() => {
    setButtonPosition({
      x: window.innerWidth - 10,
      y: window.innerHeight - 100
    });
    
    const savedPosition = localStorage.getItem('profileButtonPosition');
    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        if (
          parsedPosition.x >= 0 && 
          parsedPosition.x <= window.innerWidth - 56 &&
          parsedPosition.y >= 0 && 
          parsedPosition.y <= window.innerHeight - 56
        ) {
          setButtonPosition(parsedPosition);
        }
      } catch (e) {
        console.error('Failed to parse saved button position');
      }
    }
  }, []);
  
  useEffect(() => {
    if (buttonPosition.x !== 0 && buttonPosition.y !== 0) {
      localStorage.setItem('profileButtonPosition', JSON.stringify(buttonPosition));
    }
  }, [buttonPosition]);
  
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showMoveHandle) {
      setIsDragging(true);
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setButtonOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      
      e.preventDefault();
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showMoveHandle && e.touches.length === 1) {
      setIsDragging(true);
      
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setButtonOffset({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        });
      }
      
      e.preventDefault();
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - buttonOffset.x;
      let newY = e.clientY - buttonOffset.y;
      newX = Math.max(0, Math.min(window.innerWidth - 56, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 56, newY));
      
      setButtonPosition({ x: newX, y: newY });
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      
      let newX = e.touches[0].clientX - buttonOffset.x;
      let newY = e.touches[0].clientY - buttonOffset.y;
      
      newX = Math.max(0, Math.min(window.innerWidth - 56, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 56, newY));
      
      setButtonPosition({ x: newX, y: newY });
      
      e.preventDefault();
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, buttonOffset]);
  
  useEffect(() => {
    const handleResize = () => {
      setButtonPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 56),
        y: Math.min(prev.y, window.innerHeight - 56)
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const SidebarContent = () => (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-700">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Professional Profile
          </h1>
          <div className="md:hidden">
            <button onClick={toggleModal} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 flex items-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-400" />
              Skills
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {userData?.skills?.length > 0 ? (
              userData.skills.map((skill, index) => (
                <div key={index} className="bg-black bg-opacity-70 rounded-full px-4 py-2 transition-all hover:bg-opacity-90 hover:shadow-lg border border-gray-800">
                  <h3 className="font-medium text-gray-200">{skill}</h3>
                </div>
              ))
            ) : (
              <div className="w-full text-gray-400 text-center py-4 bg-black bg-opacity-50 rounded-xl">
                No skills added yet
              </div>
            )}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 flex items-center">
              <Award className="w-5 h-5 md:w-6 md:h-6 mr-2 text-gray-400" />
              Education
            </h2>
          </div>
          
          <div className="space-y-4">
            {userData?.education?.length > 0 ? (
              userData.education.map((elem, index) => (
                <div key={index} className="bg-black bg-opacity-70 p-4 rounded-xl transition-all hover:shadow-lg hover:bg-opacity-80 border border-gray-800">
                  <h3 className="font-semibold text-white">
                    {elem.institution}
                  </h3>
                  <p className="font-medium text-gray-300 mt-1">
                    {elem.degree}
                    {elem.field && <span> • {elem.field}</span>}
                  </p>
                  <div className="flex items-center text-gray-400 text-sm mt-2">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    <span>
                      {elem.start_date}
                      {elem.end_date && <span> - {elem.end_date}</span>}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4 bg-black bg-opacity-50 rounded-xl">
                No education details available
              </div>
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
            {userData?.experience?.length > 0 ? (
              userData.experience.map((elem, index) => (
                <div key={index} className="bg-black bg-opacity-70 p-4 rounded-xl transition-all hover:shadow-lg hover:bg-opacity-80 border border-gray-800 group">
                  <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {elem.company}
                  </h3>
                  <p className="font-medium text-gray-300 mt-1">
                    {elem.title}
                  </p>
                  <div className="flex items-center text-gray-400 text-sm mt-2">
                    <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                    <span>
                      {elem.start_date}
                      {elem.end_date && <span> - {elem.end_date}</span>}
                    </span>
                  </div>
                  {elem.description && (
                    <div className="mt-3 relative overflow-hidden">
                      <p className="text-gray-300 text-sm line-clamp-2 group-hover:line-clamp-none transition-all">
                        {elem.description}
                      </p>
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black to-transparent group-hover:opacity-0 transition-opacity"></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4 bg-black bg-opacity-50 rounded-xl">
                No experience added yet
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md">
            <FileText className="w-5 h-5 mr-2" />
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block max-w-4xl mx-auto">
        <SidebarContent />
      </div>

      <div 
        ref={buttonRef}
        className="md:hidden fixed z-50"
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          touchAction: isDragging ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setShowMoveHandle(true)}
        onMouseLeave={() => !isDragging && setShowMoveHandle(false)}
      >
        <div className="relative">
          <button 
            onClick={toggleModal}
            className={`flex items-center justify-center bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg transition-all transform 
            ${isDragging ? 'opacity-80' : 'hover:bg-blue-500 hover:scale-110 active:scale-95'}`}
          >
            <User className="w-6 h-6" />
          </button>
          {showMoveHandle && (
            <div 
              className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-700 text-white p-1.5 rounded-full shadow-lg 
                transition-opacity ${isDragging ? 'opacity-80' : 'opacity-90'}`}
            >
              <Move className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm transition-all">
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSidebar;