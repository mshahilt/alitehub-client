import { Camera, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/redux/store';
import { useEffect } from 'react';
import { fetchUserProfile } from '../../app/redux/slices/user/userSlice';
import ProfileSkeleton from '../Loading/SkeltonProfileLoading';

interface ProfileComponentProps {
  username: string;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ username }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, status, error } = useSelector((state: RootState) => state.userState) as { 
    data: { name: string, username: string;  }, 
    status: string, 
    error: string 
  };

  useEffect(() => {
    dispatch(fetchUserProfile(username));
    console.log("inside profile component",data)
  }, [dispatch, username]); 

  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto text-white bg-secondary">
      <div className="relative">
        <div className="h-32 w-full bg-gradient-to-r from-blue-400 to-blue-100 rounded-t-lg"></div>
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-[#1a1a2e] bg-purple-300 overflow-hidden">
            <img 
              src="/api/placeholder/128/128" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-20 px-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{data?.name}</h1>
            <p className="text-gray-400 text-sm">{data?.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
              Brototype
            </button>
            <button className="p-2 bg-gray-800 rounded-lg">
              <Edit2 size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-300 space-y-1">
          <p>Lorem Ipsum is simply dummy text of</p>
          <p>the printing and typesetting industry.</p>
          <p>Lorem Ipsum</p>
        </div>

        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <span className="font-bold">924</span>
            <span className="text-gray-400 ml-1">followers</span>
          </div>
          <div>
            <span className="font-bold">736</span>
            <span className="text-gray-400 ml-1">followings</span>
          </div>
          <div>
            <span className="font-bold">0</span>
            <span className="text-gray-400 ml-1">posts</span>
          </div>
        </div>

        <div className="flex border-b border-gray-800 mt-8">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-white">
            POSTS
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400">
            SAVED
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400">
            TAGS
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Camera size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Share Photos</h3>
          <p className="text-gray-400 text-sm mb-4">When you share photos they will appear here</p>
          <button className="text-blue-500 text-sm hover:underline">
            Share your first photo
          </button>
        </div>
      </div>
    </div>
  );  
};

export default ProfileComponent;
