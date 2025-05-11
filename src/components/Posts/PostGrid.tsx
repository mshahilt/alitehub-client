import { RootState } from '@/app/redux/store';
import { Card, CardContent } from '@/components/ui/card';
import axiosInstance from '@/services/api/userInstance';
import { Camera, Expand, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PostModal from './Post';

export interface IPOST {
  _id: string;
  userId: string;
  media: string;
  title: string;
  description: string;
  time: string;
  tags: string[];
  likes?: number;
}

const PostsGrid = () => {
  const [posts, setPosts] = useState<IPOST[]>([]);
  const [selectedPost, setSelectedPost] = useState<IPOST | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchedProfile } = useSelector((state: RootState) => state.userAuth);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!fetchedProfile) return;
        const response = await axiosInstance.get<{ posts: IPOST[] }>(`/post/user/${fetchedProfile?.id}`);
        setPosts(response.data.posts);
      } catch (error: any) {
        console.log(error.message);
      }
    };
    fetchPosts();
  }, [fetchedProfile]);

  const openPostModal = (post: IPOST) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPost(null), 200);
  };

  const PostCard = ({ post }: { post: IPOST }) => {
    const [isHovered, setIsHovered] = useState(false);
  
    return (
      <Card 
        className="overflow-hidden bg-transparent rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0 relative">
          <div className="relative w-full">
            <img 
              src={post.media} 
              alt={post.title} 
              className="w-full aspect-square object-cover rounded-t-xl"
            />
            {isHovered && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4">
                <button 
                  onClick={() => openPostModal(post)}
                  className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition"
                >
                  <Expand className="text-white" size={24} />
                </button>
                <button className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                  <Heart className="text-white" size={24} />
                </button>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-800/60 backdrop-blur-sm rounded-b-xl">
            <h3 className="text-white font-bold text-lg truncate mb-1">{post.title}</h3>
            <p className="text-gray-300 text-sm truncate">{post.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-gray-900 p-6 min-h-screen">
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Camera size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Share Photos</h3>
          <p className="text-gray-400 text-sm mb-4">When you share photos they will appear here</p>
          <button className="text-blue-500 text-sm hover:underline">
            Share your first photo
          </button>
        </div>
      )}

      <PostModal 
        post={selectedPost} 
        isOpen={isModalOpen} 
        onClose={closePostModal} 
      />
    </div>
  );
};

export default PostsGrid;