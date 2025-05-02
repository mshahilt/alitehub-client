import { Heart, MessageSquare, X, Send } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/services/api/userInstance";

interface Post {
  id: string;
  media: string;
  tags: string[];
  title: string;
  time: Date;
  description: string;
  user: {
    username: string;
    name: string;
    profile_picture: string;
  }
}

interface Comment {
  id: string;
  content: string;
  time: string;
  authorName: string;
  user: {
    username: string;
    name: string;
  }
}

const PostCard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [likeData, setLikeData] = useState<{ [key: string]: { count: number; isLiked: boolean } }>({});
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<{ [key: string]: boolean }>({});
  const commentInputRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

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

        newPosts.forEach(async (post) => {
          try {
            const [likeCountResponse, isLikedResponse, commentCountResponse] = await Promise.all([
              axiosInstance.get(`/like/count/${post.id}`),
              axiosInstance.get(`/like/isLiked/${post.id}`),
              axiosInstance.get(`/comment/count/${post.id}`)
            ]);

            setLikeData((prev) => ({
              ...prev,
              [post.id]: { 
                count: likeCountResponse.data.count, 
                isLiked: isLikedResponse.data.status 
              },
            }));

            setCommentCounts((prev) => ({
              ...prev,
              [post.id]: commentCountResponse.data.count
            }));
          } catch (error) {
            console.error(`Error fetching data for post ${post.id}:`, error);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const handleLike = useCallback(async (postId: string) => {
    try {
      const currentLikeData = likeData[postId] || { count: 0, isLiked: false };
      const newIsLiked = !currentLikeData.isLiked;

      setLikeData((prev) => ({
        ...prev,
        [postId]: {
          count: newIsLiked ? currentLikeData.count + 1 : currentLikeData.count - 1,
          isLiked: newIsLiked,
        },
      }));

      if (newIsLiked) {
        await axiosInstance.post('/like', { target_id: postId, target_type: "Post" });
      } else {
        await axiosInstance.delete(`/like`, { data: { target_id: postId } });
      }
    } catch (error) {
      console.error("Error handling like:", error);
      setLikeData((prev) => ({
        ...prev,
        [postId]: likeData[postId] || { count: 0, isLiked: false },
      }));
    }
  }, [likeData]);

  const toggleComments = useCallback(async (postId: string) => {
    const isExpanded = expandedComments[postId] || false;
    
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !isExpanded
    }));

    if (!isExpanded && (!comments[postId] || comments[postId].length === 0)) {
      try {
        const response = await axiosInstance.get(`/comment/${postId}`);
        setComments(prev => ({
          ...prev,
          [postId]: response.data || []
        }));
      } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
      }
    }
  }, [expandedComments, comments]);

  const handleCommentInput = useCallback((postId: string, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [postId]: value
    }));
  }, []);

  const submitComment = useCallback(async (postId: string) => {
    const commentContent = newComments[postId]?.trim();
    if (!commentContent) return;

    setSubmittingComment(prev => ({
      ...prev,
      [postId]: true
    }));

    try {
      const response = await axiosInstance.post('/comment', {
        post_id: postId,
        content: commentContent
      });

      // Add the new comment to our state
      const newComment = response.data.comment || {
        id: Date.now().toString(),
        content: commentContent,
        createdAt: new Date().toISOString(),
        authorName: "You"
      };

      setComments(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }));

      // Update comment count
      setCommentCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));

      // Clear the input
      setNewComments(prev => ({
        ...prev,
        [postId]: ""
      }));
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(prev => ({
        ...prev,
        [postId]: false
      }));
    }
  }, [newComments]);

  const handleDeleteComment = useCallback(async (postId: string, commentId: string) => {
    try {
      await axiosInstance.delete(`/comment/${commentId}`);
      
      // Remove the comment from our state
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment.id !== commentId)
      }));

      // Update comment count
      setCommentCounts(prev => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || 1) - 1)
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }, []);

  // Handle textarea auto-resize
  const handleTextareaResize = useCallback((postId: string) => {
    const textarea = commentInputRefs.current[postId];
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Handle Enter key for submitting comment
  const handleKeyDown = useCallback((e: React.KeyboardEvent, postId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment(postId);
    }
  }, [submitComment]);

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
      {posts.map((post) => {
        const postLikeData = likeData[post.id] || { count: 0, isLiked: false };
        const isCommentsExpanded = expandedComments[post.id] || false;
        const postComments = comments[post.id] || [];
        const commentCount = commentCounts[post.id] || 0;
        const isSubmitting = submittingComment[post.id] || false;

        return (
          <div key={post.id} className="bg-secondary p-5 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0"
                  src={post?.user?.profile_picture || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="}
                  alt="Profile"
                />
                <div>
                  <h3 className="text-sm md:text-base font-semibold">{post.user.name}</h3>
                  <p className="text-xs md:text-sm text-gray-400">{post.user.username}</p>
                </div>
                </div>
              <p className="text-xs md:text-xs text-gray-400">{new Date(post.time).toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm md:text-base text-gray-200 mb-3 break-words">
                {post.description}
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-blue-500 hover:underline cursor-pointer">
                    {" "}#{tag}
                  </span>
                ))}
              </p>
              {post.media && (
                <div className="rounded-xl overflow-hidden h-100 bg-gray-800 flex items-center justify-center">
                  <img src={post.media} alt="Post" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mb-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-gray-400" />
                {postLikeData.count}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} className="text-gray-400" />
                {commentCount}
              </span>
            </div>

            <div className="flex items-center gap-6 border-t border-gray-800 pt-3">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Heart
                  size={20}
                  className={`${postLikeData.isLiked ? 'fill-current text-red-500' : ''} hover:fill-current`}
                />
                <span>Like</span>
              </button>
              <button 
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <MessageSquare 
                  size={20}
                  className={isCommentsExpanded ? 'text-blue-500' : ''}
                />
                <span>Comment</span>
              </button>
            </div>

            {isCommentsExpanded && (
              <div className="mt-4 border-t border-gray-800 pt-4">
                <div className="flex items-start gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0"></div>
                  <div className="flex-grow relative">
                    <textarea
                      ref={el => (commentInputRefs.current[post.id] = el)}
                      value={newComments[post.id] || ''}
                      onChange={e => {
                        handleCommentInput(post.id, e.target.value);
                        handleTextareaResize(post.id);
                      }}
                      onKeyDown={e => handleKeyDown(e, post.id)}
                      placeholder="Write a comment..."
                      className="w-full bg-gray-900 text-white rounded-lg p-3 pr-10 resize-none min-h-[40px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={1}
                    />
                    <button
                      onClick={() => submitComment(post.id)}
                      disabled={isSubmitting || !newComments[post.id]?.trim()}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {postComments.length > 0 ? (
                    postComments.map(comment => (
                      <div key={comment.id} className="flex gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0"></div>
                        <div className="flex-grow">
                          <div className="bg-gray-900 rounded-lg p-3 relative">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">{comment?.user?.name || "You"}</h4>
                              <button
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-300 break-words">{comment.content}</p>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex gap-3 ml-2">
                            <button className="hover:text-white transition-colors duration-200">Like</button>
                            <button className="hover:text-white transition-colors duration-200">Reply</button>
                            <span>{new Date(comment.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-2">No comments yet. Be the first to comment!</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

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