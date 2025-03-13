import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/services/api/userInstance";

interface Post {
  id: string;
  media: string;
  tags: string[];
  title: string;
  description: string;
}

const PostCard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/post?page=${page}&limit=5`);
      const newPosts: Post[] = response.data.posts;

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [
          ...prevPosts,
          ...newPosts.filter((newPost) => !prevPosts.some((post) => post.id === newPost.id)),
        ]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight
      ) {
        fetchPosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="space-y-6 w-full">
      {posts.map((post) => (
        <div key={post.id} className="bg-secondary p-4 rounded-lg shadow-md text-white ml-15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm md:text-base font-semibold">Anonymous User</h3>
                <p className="text-xs md:text-sm text-gray-400">Just now</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="mb-3">
            <p className="text-sm md:text-base text-gray-200 mb-2 break-words">
              {post.description}
              {post.tags.map((tag, index) => (
                <span key={index} className="text-blue-500 hover:underline cursor-pointer">
                  {" "}
                  #{tag}
                </span>
              ))}
            </p>
            {post.media && (
              <div className="rounded-lg overflow-hidden max-h-[300px]">
                <img src={post.media} alt="Post" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm text-gray-400">
            <span>100 Likes</span>
            <span>50 Comments</span>
            <span>20 Shares</span>
          </div>

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

      {isLoading && (
        <div className="text-center text-gray-400 py-4">Loading more posts...</div>
      )}

      {!hasMore && (
        <div className="text-center text-gray-400 py-4">No more posts to load</div>
      )}
    </div>
  );
};

export default PostCard;