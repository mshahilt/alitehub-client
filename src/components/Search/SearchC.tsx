import React, { useState, useEffect, FormEvent } from 'react';
import debounce from 'lodash.debounce';
import axiosInstance from '@/services/api/userInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import { Heart, ImageIcon, MessageSquare } from 'lucide-react';
import PostModal, {IPOST} from '../Posts/Post';
interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  profile_picture: string;
}

interface Post extends IPOST{}
interface Job {
  id: string;
  jobTitle: string;
  description: string;
  company: string;
  jobLocation: string;
  jobType: string;
  skills: string[];
  postedDate: string;
}

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  employees: number;
  description?: string;
}

interface RecentSearch {
  _id: string;
  userId: string;
  search: {
    query: string;
    filter: string;
  };
  createdAt: string;
}

interface SearchResponse {
  results: {
    users: User[];
    posts: Post[];
    jobs: Job[];
    companies: Company[];
  };
}

interface SearchProps {
  bgColor?: string;
  isAdmin?: boolean
}

const SearchC: React.FC<SearchProps> = ({isAdmin = false}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'posts' | 'jobs' | 'companies'>(isAdmin ? 'all' : 'all');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabChanging, setTabChanging] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<IPOST | null>();
  const navigate = useNavigate();

  const availableFilters = isAdmin 
    ? ['all', 'users', 'companies'] as const
    : ['all', 'users', 'posts', 'jobs', 'companies'] as const;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  useEffect(() => {
    fetchRecentSearches();
    if (!isAdmin) {
      fetchExplorePosts();
    }
  }, [isAdmin]);

  const debouncedSearch = debounce(async () => {
    if (searchQuery.length > 0) {
      await performSearch();
    } else {
      setUsers([]);
      setPosts([]);
      setJobs([]);
      setCompanies([]);
    }
  }, 300);

  useEffect(() => {
    if (activeFilter !== 'all') {
      setTabChanging(true);
      setTimeout(() => setTabChanging(false), 300);
    }
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchQuery, activeFilter]);

  const fetchRecentSearches = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/search/recent');
      const data: RecentSearch[] = response.data;
      setRecentSearches(data);
    } catch (err) {
      setError('Failed to load recent searches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchExplorePosts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/search/explore');
      const rawData: Post[] = response.data;
  
      const dataWithMediaType = await Promise.all(
        rawData.map(async (post) => {
          const extension = post.media.split('.').pop()?.toLowerCase();
          let mediaType: string;
  
          if (['mp4', 'mov', 'webm'].includes(extension || '')) {
            mediaType = 'video';
          } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            mediaType = 'image';
          } else {
            mediaType = 'unknown';
          }
  
          const { comment, like } = await fetchPostState(post._id);
  
          return {
            ...post,
            mediaType,
            comments: comment,
            likes: like
          };
        })
      );
  
      setExplorePosts(dataWithMediaType);
      console.log('Updated explorePosts:', dataWithMediaType);
    } catch (err) {
      setError('Failed to load explore posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const fetchPostState = async (postId: string) => {

      const [likeCountResponse, commentCountResponse] = await Promise.all([
        axiosInstance.get(`/like/count/${postId}`),
        axiosInstance.get(`/comment/count/${postId}`)
      ]);
      return {like: likeCountResponse.data.count, comment: commentCountResponse.data.count}
  }

  const performSearch = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get('/search', {
        params: {
          q: searchQuery,
          filter: activeFilter,
          isAdmin: isAdmin
        }
      });
      
      const data: SearchResponse = response.data;
      
      setTimeout(() => {
        setUsers(data.results.users || []);
        if (!isAdmin) {
          setPosts(data.results.posts || []);
          setJobs(data.results.jobs || []);
        } else {
          setPosts([]);
          setJobs([]);
        }
        setCompanies(data.results.companies || []);
        setIsLoading(false);
      }, 300);
    } catch (err) {
      setError('Failed to perform search');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      await axiosInstance.post('/search/recent', {
        query: searchQuery,
        filter: activeFilter
      });
      await fetchRecentSearches();
    } catch (err) {
      console.error('Failed to save search:', err);
    }
  };

  const handleViewPost = (id: string) => {
    try {
      const selectedPost = explorePosts.find((elem) => elem._id === id);
      setSelectedPost(selectedPost);
      setTimeout(() => setIsModalOpen(true), 200);

      console.log("selectedPost :", selectedPost);
    } catch (error) {
      
    }
  }
  const closePostModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPost(null), 200);
  };
  
  const clearRecentSearches = async (): Promise<void> => {
    try {
      await axiosInstance.delete('/search/recent');
      setRecentSearches([]);
    } catch (err) {
      console.error('Failed to clear searches:', err);
    }
  };

  const removeRecentSearch = async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/search/recent/${id}`);
      setRecentSearches(recentSearches.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to remove search:', err);
    }
  };

  const hasResults = (isAdmin 
    ? (users.length > 0 || companies.length > 0) 
    : (users.length > 0 || posts.length > 0 || jobs.length > 0 || companies.length > 0));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const renderFilterTabs = () => (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto">
          {availableFilters.map(filter => (
            <div key={filter} className="relative">
              <button
                className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${activeFilter === filter ? 'text-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
              {activeFilter === filter && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                  layoutId="activeFilter"
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex justify-center py-6">
      <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  const renderFilteredResults = () => {
    if (activeFilter === 'all' || activeFilter === 'users') {
      return users.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h3 className="text-md font-medium text-gray-300 mb-2">Users</h3>
          {users.map(user => (
            <motion.div 
              key={`user-${user.id}`} 
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg mb-2 transition-colors duration-200"
              variants={itemVariants}
            >
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div 
                className="ml-3 flex-1 cursor-pointer" 
                onClick={() => navigate(isAdmin ? `/admin/user/${user.username}` : `/${user.username}`)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-sm text-gray-400">{user.username}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderPostResults = () => {
    if (!isAdmin && (activeFilter === 'all' || activeFilter === 'posts')) {
      return (
        posts.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h3 className="text-md font-medium text-gray-300 mb-2">Posts</h3>
            {posts.map(post => (
              <motion.div 
                key={`post-${post._id}`} 
                className="flex items-center p-2 hover:bg-gray-800 rounded-lg mb-2 transition-colors duration-200"
                variants={itemVariants}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                  {post.media ? (
                    <img src={post.media} alt="Post" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <span className="font-medium">{post.title}</span>
                  <div className="text-sm text-gray-400">
                    {post.description.length > 60 
                      ? post.description.substring(0, 60) + '...' 
                      : post.description}
                  </div>
                  <div className="flex space-x-4 mt-1 text-xs text-gray-500">
                    <span>{formatNumber(post.likes || 0)} likes</span>
                    <span>{formatNumber(post.comments || 0)} comments</span>
                    <span>{new Date(post.time).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null
      );
    }
    return null;
  };
  
  const renderJobResults = () => {
    if (!isAdmin && (activeFilter === 'all' || activeFilter === 'jobs')) {
      return jobs.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h3 className="text-md font-medium text-gray-300 mb-2">Jobs</h3>
          {jobs.map(job => (
            <motion.div 
              key={`job-${job.id}`} 
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg mb-2 transition-colors duration-200"
              variants={itemVariants}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <span className="font-medium">{job.jobTitle}</span>
                <div className="text-sm text-gray-400">{job.company} • {job.jobLocation}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">{job.jobType}</span>
                  {job.skills.slice(0, 2).map((skill, idx) => (
                    <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{skill}</span>
                  ))}
                  {job.skills.length > 2 && (
                    <span className="text-xs text-gray-400">+{job.skills.length - 2} more</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400 ml-2">
                {new Date(job.postedDate).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderCompanyResults = () => {
    if (activeFilter === 'all' || activeFilter === 'companies') {
      return companies.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h3 className="text-md font-medium text-gray-300 mb-2">Companies</h3>
          {companies.map(company => (
            <motion.div 
              key={`company-${company.id}`} 
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg mb-2 transition-colors duration-200"
              variants={itemVariants}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-xl font-medium text-white">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div 
                className="ml-3 flex-1 cursor-pointer" 
                onClick={() => isAdmin 
                  ? navigate(`/admin/company/${company.id}`) 
                  : console.log('View company:', company.id)
                }
              >
                <span className="font-medium">{company.name}</span>
                <div className="text-sm text-gray-400">{company.industry} • {company.location}</div>
                <div className="text-xs text-gray-500 mt-1">{formatNumber(company.employees)} employees</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 z-10">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                placeholder={isAdmin ? "Search users and companies" : "Search"}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchQuery('')}
                  >
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>

      {renderFilterTabs()}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <div className="container mx-auto px-4 py-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4 text-red-400"
              >
                {error}
              </motion.div>
            ) : searchQuery.length > 0 ? (
              <motion.div
                key="search-results"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeVariants}
              >
                {hasResults ? (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {!tabChanging && (
                        <>
                          {renderFilteredResults()}
                          {renderPostResults()}
                          {renderJobResults()}
                          {renderCompanyResults()}
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="default-view"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeVariants}
              >
                {recentSearches.length > 0 && (
                  <motion.div 
                    className="mb-6"
                    variants={containerVariants}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Recent</h2>
                      <motion.button 
                        className="text-blue-400 text-sm font-medium"
                        onClick={clearRecentSearches}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear All
                      </motion.button>
                    </div>
                    <div className="space-y-3">
                      {recentSearches.map(item => (
                        <motion.div 
                          key={item._id} 
                          className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
                        >
                          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1 cursor-pointer" onClick={() => {
                            setSearchQuery(item.search.query);
                            setActiveFilter(item.search.filter as any);
                          }}>
                            <span className="font-medium">{item.search.query}</span>
                            <div className="text-sm text-gray-400">
                              Filter: {item.search.filter.charAt(0).toUpperCase() + item.search.filter.slice(1)}
                            </div>
                          </div>
                          <motion.button 
                            className="text-gray-400 hover:text-gray-300"
                            onClick={() => removeRecentSearch(item._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {!isAdmin && (
                 <motion.div
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
                 className="max-w-6xl mx-auto"
               >
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                   {explorePosts.map((post) => (
                     <motion.div 
                       key={post._id} 
                       className="group relative rounded-xl overflow-hidden bg-gray-800 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300"
                       variants={itemVariants}
                       whileHover={{ 
                         y: -5,
                         transition: { duration: 0.2 }
                       }}
                       whileTap={{ scale: 0.98 }}
                     >
                       <div className="aspect-square relative overflow-hidden">
                         {post.media ? (
                           post.mediaType === 'video' ? (
                             <div className="w-full h-full">
                               <VideoPlayer 
                                 src={post.media} 
                                 noControls={true}
                               />
                               <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                                 Video
                               </div>
                             </div>
                           ) : (
                             <img
                               src={post.media}
                               alt={`Post by ${post.mediaType || 'unknown user'}`}
                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                               loading="lazy"
                             />
                           )
                         ) : (
                           <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                             <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                           </div>
                         )}
                         
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                       </div>
                       
                       <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <div className="flex items-center justify-between text-white">
                           <div className="flex items-center space-x-3">
                             <div className="flex items-center space-x-1" aria-label={`${post.likes || 0} likes`}>
                               <Heart className="h-4 w-4" />
                               <span className="text-sm font-medium">{formatNumber(post.likes || 0)}</span>
                             </div>
                             <div className="flex items-center space-x-1" aria-label={`${post.comments || 0} comments`}>
                               <MessageSquare className="h-4 w-4" />
                               <span className="text-sm font-medium">{formatNumber(post.comments || 0)}</span>
                             </div>
                           </div>
                           
                           <button 
                             className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                             aria-label="View post details"
                           >
                             <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                               <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                           </button>
                         </div>
                       </div>
                       <a onClick={() => handleViewPost(post._id)} className="absolute inset-0 z-10 overflow-hidden text-0 indent-[-9999px]" aria-label={`View post ${post._id}`}>
                         View post 
                       </a>
                     </motion.div>
                   ))}
                 </div>
               </motion.div>

                )}
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>
      <PostModal 
        post={selectedPost} 
        isOpen={isModalOpen} 
        onClose={closePostModal} 
      />
    </div>
  );
};

export default SearchC;