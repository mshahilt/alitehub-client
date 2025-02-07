import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import postData from "../../app/data/postData";
import { useEffect } from "react";
import axiosInstance from "../../services/api/userInstance";

const PostCard = () => {
  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance.get('/');
      console.log(response);
    };
    fetchData();
  }, [])
  return (
    <div className="space-y-6 w-full">
      {postData.map((post, index) => (
        <div
          key={index}
          className="bg-secondary p-4 rounded-lg shadow-md text-white ml-15">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm md:text-base font-semibold">{post.username}</h3>
                <p className="text-xs md:text-sm text-gray-400">{post.postedOn}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-sm md:text-base text-gray-200 mb-2 break-words">
              {post.content}{" "}
              <span className="text-blue-500 hover:underline cursor-pointer">#hashtag</span>
            </p>
            {post.image && (
              <div className="rounded-lg overflow-hidden max-h-[300px]">
                <img src={post.image} alt="Post" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm text-gray-400">
            <span>{post.likeCount} Likes</span>
            <span>{post.commentCount} Comments</span>
            <span>{post.shareCount} Shares</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-700 pt-3">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
              <Heart size={20} className="hover:fill-current" />
              <span className="hidden sm:inline">Like</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
              <MessageSquare size={20} />
              <span className="hidden sm:inline">Comment</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white">
              <Share2 size={20} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostCard;
