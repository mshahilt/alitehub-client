import { Camera, Edit2 } from 'lucide-react';

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-secondary p-6">
      {/* Profile Header Section */}
      <div className="space-y-4">
        {/* Avatar Skeleton */}
        <div className="w-24 h-24 rounded-full bg-purple-300/30 animate-pulse" />
        
        {/* Name and Username */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="h-8 bg-purple-300/30 rounded-md w-48 animate-pulse" />
            <div className="px-4 py-2 bg-purple-300/20 rounded-md">
              <span className="text-gray-300">Brototype</span>
            </div>
            <div className="w-8 h-8 bg-purple-300/20 rounded-md flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-gray-300" />
            </div>
          </div>
          <div className="h-4 bg-purple-300/30 rounded-md w-32 animate-pulse" />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="h-4 bg-purple-300/30 rounded-md w-full max-w-md animate-pulse" />
          <div className="h-4 bg-purple-300/30 rounded-md w-3/4 max-w-md animate-pulse" />
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-gray-300">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-purple-300/30 rounded-md w-12 animate-pulse" />
            <span>followers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-purple-300/30 rounded-md w-12 animate-pulse" />
            <span>followings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-purple-300/30 rounded-md w-8 animate-pulse" />
            <span>posts</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-700 pb-2">
          <div className="text-white border-b-2 border-white pb-2">POSTS</div>
          <div className="text-gray-400">SAVED</div>
          <div className="text-gray-400">TAGS</div>
        </div>

        {/* Share Photos Section */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-12">
          <div className="w-16 h-16 rounded-full bg-purple-300/20 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-300" />
          </div>
          <div className="text-xl text-white">Share Photos</div>
          <div className="text-gray-400 text-center">When you share photos they will appear here</div>
          <div className="text-blue-400">Share your first photo</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;