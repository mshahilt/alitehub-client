    import { RootState } from '@/app/redux/store';
    import { Card, CardContent } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import axiosInstance from '@/services/api/userInstance';
    import { Camera, Expand, Heart } from 'lucide-react';
    import { useEffect, useState } from 'react';
    import { useSelector } from 'react-redux';

    interface Post {
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
        const [posts, setPosts] = useState<Post[]>([]);
        const [selectedPost, setSelectedPost] = useState<Post | null>(null);
        const { fetchedProfile } = useSelector((state: RootState) => state.userAuth);

        useEffect(() => {
            const fetchPosts = async () => {
                try {
                    if (!fetchedProfile) return;
                    const response = await axiosInstance.get<{ posts: Post[] }>(`/post/user/${fetchedProfile?.id}`);
                    setPosts(response.data.posts);
                } catch (error: any) {
                    console.log(error.message);
                }
            };
            fetchPosts();
        }, [fetchedProfile]);

        const PostCard = ({ post }: { post: Post }) => {
            const [isHovered, setIsHovered] = useState(false);
        
            return (
                <Card 
                    className="overflow-hidden bg-transparent rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-[300px]"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <CardContent className="p-0 relative">
                        <div className="relative w-full">
                            <img 
                                src={post.media} 
                                alt={post.title} 
                                className="w-full aspect-video object-cover rounded-t-xl"
                            />
                            {isHovered && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4">
                                    <button 
                                        onClick={() => setSelectedPost(post)}
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
            <div className="bg-secondary p-6 min-h-screen">
                {posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-6 justify-center">
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

                {selectedPost && (
                    <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
                        <DialogContent className="sm:max-w-[75vw] bg-gray-900 border-none rounded">
                            <DialogHeader>
                                <DialogTitle className="text-white text-2xl">{selectedPost.title}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6">
                            <img 
                                src={selectedPost.media} 
                                alt={selectedPost.title} 
                                className="w-full max-h-[500px] object-contain rounded-xl"
                            />

                                <div className="text-white">
                                    <p className="text-gray-400 mb-6 text-base">{selectedPost.description}</p>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Heart className="text-red-500" size={24} />
                                        <span className="text-base">{selectedPost.likes || 0} Likes</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3 text-lg">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPost.tags?.map((tag) => (
                                                <span 
                                                    key={tag} 
                                                    className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        );
    };

    export default PostsGrid;