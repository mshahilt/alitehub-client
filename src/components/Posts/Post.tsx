import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Heart, MessageCircle, Loader2, Send } from "lucide-react";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import axiosInstance from "@/services/api/userInstance";

export interface IPOST {
  _id: string;
  userId: string;
  media: string;
  title: string;
  description: string;
  time: string;
  tags: string[];
  likes?: number;
  comments?: number;
  mediaType?: string;
}

interface IComment {
  id: string;
  post_id: string;
  content: string;
  time: string;
  user_id: string;
  replies: any[];
  user: {
    username: string;
    name: string;
  };
}

const PostModal = ({
  post,
  isOpen,
  onClose,
}: {
  post: IPOST | any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<IComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    const fetchPostData = async (postId: string) => {
      try {
        const [likeCountResponse, isLikedResponse, commentCountResponse] = await Promise.all([
          axiosInstance.get(`/like/count/${postId}`),
          axiosInstance.get(`/like/isLiked/${postId}`),
          axiosInstance.get(`/comment/count/${postId}`)
        ]);

        setLikeCount(likeCountResponse.data.count || 0);
        setIsLiked(isLikedResponse.data.isLiked || false);
        setCommentCount(commentCountResponse.data.count || 0);
        
        await fetchComments(postId);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    if (post) {
      setIsMediaLoading(true);
      fetchPostData(post._id);
    }
  }, [post?._id]);

  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await axiosInstance.get(`/comment/${postId}`);
      // The response is an array of comments directly
      setComments(response.data || []);
      // Update comment count based on actual comments received
      setCommentCount(response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!post) return;
    
    try {
      if (isLiked) {
        await axiosInstance.delete(`/like`, { data: { target_id: post._id } });
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await axiosInstance.post('/like', { target_id: post._id, target_type: "Post" });
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSubmitComment = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;
    
    setIsSubmitting(true);
    try {
        await axiosInstance.post('/comment', {
        post_id: post._id,
        content: commentContent
      });
      
      setCommentContent("");
      await fetchComments(post._id);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  const getOptimizedVideoUrl = (url: string) => {
    if (url.includes('cloudinary.com') && post.mediaType === 'video') {
      const optimizedUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
      return optimizedUrl;
    }
    return url;
  };

  const getOptimizedImageUrl = (url: string) => {
    if (url.includes('cloudinary.com')) {
      const optimizedUrl = url.replace('/upload/', '/upload/w_auto,c_scale,q_auto/');
      return optimizedUrl;
    }
    return url;
  };

  const handleMediaLoad = () => {
    setIsMediaLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[75vw] bg-gray-900 border-none rounded-xl p-6 text-white max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-white text-2xl font-bold">
            {post.title}
          </DialogTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
          <div className="bg-black/30 rounded-xl p-2 flex items-center justify-center relative min-h-[300px]">
            {isMediaLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}

            {post.media && (
              <>
                {post.mediaType === 'video' ? (
                  <div className="w-full h-full">
                    <VideoPlayer 
                      src={getOptimizedVideoUrl(post.media)} 
                      noControls={false}
                      className={isMediaLoading ? "opacity-0" : "opacity-100"}
                      onLoadedData={handleMediaLoad}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      Video
                    </div>
                  </div>
                ) : (
                  <img
                    src={getOptimizedImageUrl(post.media)}
                    alt={post.title}
                    className={`w-full max-h-[500px] object-contain rounded-lg transition-opacity duration-300 ${isMediaLoading ? "opacity-0" : "opacity-100"}`}
                    onLoad={handleMediaLoad}
                  />
                )}
              </>
            )}
          </div>

          <div className="flex flex-col h-full max-h-[70vh]">
            <div className="mb-4">
              <p className="text-gray-300 mb-4 text-base">{post.description}</p>

              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={handleLikeToggle}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Heart
                    className={`${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"} transition-colors`}
                    size={24}
                  />
                  <span className="text-base">{likeCount}</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <MessageCircle className="text-gray-400" size={24} />
                  <span className="text-base">{commentCount}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-lg">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-4">
                Posted: {formatDate(post.time)}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 flex-grow overflow-y-hidden">
              <h4 className="font-semibold mb-3 text-lg flex items-center">
                <MessageCircle className="mr-2" size={18} /> Comments
              </h4>
              
              <div className="space-y-4 max-h-[25vh] overflow-y-auto pr-2">
                {isLoadingComments ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-800 rounded-lg p-3 pb-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full mr-3 bg-blue-600 flex items-center justify-center text-white font-medium">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-200">
                              {comment.user.name || comment.user.username}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.time)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitComment} className="border-t border-gray-700 pt-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!commentContent.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg disabled:bg-blue-800 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;