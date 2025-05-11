import { Camera, Download, Edit2, FileText, Loader2, Upload, Video, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/redux/store';
import { useEffect, useRef, useState } from 'react';
import { fetchUserProfile } from '../../app/redux/slices/user/userAuthSlice';
import ProfileSkeleton from '../Loading/SkeltonProfileLoading';
import EditProfile from './EditeProfile';
import axiosInstance from '@/services/api/userInstance';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConnectionButtons from './ConnectionButtons';
import ConnectionCount from './ConnectionCount';
import PostsGrid from '../Posts/PostGrid';
import PostCount from '../Posts/PostCount';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileComponentProps {
  username: string;
  isAdmin?: boolean;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ username, isAdmin=false }) => {
  const dispatch: AppDispatch = useDispatch();
  const { user, loading, ownAccount } = useSelector((state: RootState) => state.userAuth);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const handleSave = async (userData: Partial<any>): Promise<void> => {
  try {
    await axiosInstance.post('/updateProfile', userData);
    dispatch(fetchUserProfile(username));
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

  
  useEffect(() => {
    dispatch(fetchUserProfile(username));
  }, [dispatch, username]);
  
  if (loading) {
    return <ProfileSkeleton />;
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024;
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an MP4, AVI, or MOV file');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return false;
    }
    
    return true;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) return;
    if (!validateFile(file)) return;

    const fileURL = URL.createObjectURL(file);
    setVideo(fileURL);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.get('/getSignedUploadUrl', {
        params:{ resource_type: "video"},
      });
      const { signature, timestamp, upload_url, api_key } = response.data.signedUrl;
 
      if (!signature || !timestamp || !upload_url || !api_key) {
        throw new Error("Invalid upload credentials received");
      }

      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const uploadResponse = await axios.post(
        upload_url,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setProgress(percentCompleted);
          },
        }
      );

      setVideo(uploadResponse.data.secure_url);
      setUploading(false);

      await axiosInstance.post('/uploadIntroductionVideo', {
        videoUrl: uploadResponse.data.secure_url
      });
      
      dispatch(fetchUserProfile(username));
      
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setVideo(null);
    setUploading(false);
    setProgress(0);
  };

  const renderMediaButtons = () => {
    if (!user?.video_url && !user?.resume_url) return null;

    return (
      <div className="flex flex-wrap gap-3 mt-6">
        {user?.video_url && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowVideoModal(true)}
                  variant="outline"
                  className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 transition-all duration-300"
                >
                  <Video size={18} className="mr-2 text-blue-400" />
                  Introduction Video
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Watch my introduction video</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {user?.resume_url && (
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setShowResumeModal(true)}
                    variant="outline"
                    className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 transition-all duration-300"
                  >
                    <FileText size={18} className="mr-2 text-blue-400" />
                    View Resume
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View my resume</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (user?.resume_url) {
                        window.open(user.resume_url, '_blank');
                      }
                    }}
                    variant="outline"
                    className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 transition-all duration-300"
                  >
                    <Download size={18} className="mr-2 text-blue-400" />
                    Download
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download my resume</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto text-white bg-gray-900">
      <div className="relative mb-20">
        <div className="h-40 w-full bg-gradient-to-r from-blue-900 to-indigo-800 rounded-lg shadow-lg"></div>
        <div className="absolute -bottom-16 left-8">
          <Avatar className="w-32 h-32 border-4 border-gray-900 shadow-xl">
            <AvatarImage 
              src={user?.profile_picture || 'https://img.freepik.com/premium-vector/user-circle-with-blue-gradient-circle_78370-4727.jpg'} 
              alt={user?.name || 'Profile'} 
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-2xl">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {ownAccount && (
          <div className="absolute right-4 -bottom-12">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300"
              size="sm"
            >
              <Edit2 size={16} className="mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <div className="flex items-center mt-1">
              <p className="text-gray-400 text-sm">@{user?.username}</p>
              {user?.is_active && (
                <Badge className="ml-2 bg-blue-600 text-white">Verified</Badge>
              )}
            </div>
          </div>
          {!isAdmin && (
          <div className="mb-6">
            <ConnectionButtons />
          </div>
          )}
        </div>

        <div className="flex gap-6 mt-2 text-sm">
          <ConnectionCount />
          <PostCount />
        </div>

        <Card className="mt-8 bg-gray-800 border-gray-700 shadow-md">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">About Me</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              {user.about}
            </p>
          </CardContent>
        </Card>

        {renderMediaButtons()}

        {ownAccount && !showUploadModal && (
          <Button
            onClick={() => setShowUploadModal(true)}
            className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300"
            size="sm"
          >
            <Camera size={16} className="mr-2" />
            Upload Introduction Video
          </Button>
        )}

        {showUploadModal && (
          <Card className="mt-6 bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-medium">Upload Introduction Video</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowUploadModal(false);
                  cancelUpload();
                }}
                className="text-gray-400 hover:text-white rounded-full"
              >
                <X size={18} />
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {video ? (
                <div className="mb-4 relative aspect-video rounded-lg overflow-hidden">
                  <VideoPlayer src={video} />
                </div>
              ) : (
                <div 
                  onClick={triggerFileInput}
                  className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-gray-700/30 transition-all duration-300 mb-4 bg-gray-900/50"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-200 font-medium">Click to select video</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, AVI, MOV (Max 100MB)</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="video/mp4,video/avi,video/quicktime" 
                    onChange={handleUpload}
                  />
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 w-full" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> 
                      Uploading...
                    </div>
                    <span className="text-gray-400">{progress}%</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                {uploading ? (
                  <Button
                    onClick={cancelUpload}
                    variant="destructive"
                    size="sm"
                  >
                    Cancel Upload
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setShowUploadModal(false);
                        cancelUpload();
                      }}
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                    
                    {video ? (
                      <Button
                        onClick={() => setShowUploadModal(false)}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save Video
                      </Button>
                    ) : (
                      <Button
                        onClick={triggerFileInput}
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Select Video
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="posts" className="mt-10">
          <TabsList className="bg-gray-800 border-b border-gray-700 w-full flex justify-start rounded-none h-auto">
            <TabsTrigger 
              value="posts"
              className="py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-400 rounded-none bg-transparent"
            >
              POSTS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <PostsGrid />
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video size={18} className="text-blue-400" />
              Introduction Video
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
            {user?.video_url && <VideoPlayer src={user.video_url} />}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent className="max-w-5xl max-h-screen bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              Resume
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] w-full rounded-lg overflow-hidden bg-gray-900">
            <object
              data={`https://docs.google.com/viewer?url=${encodeURIComponent(user?.resume_url || '')}&embedded=true`}
              type="application/pdf"
              className="w-full h-full"
            >
              <p className="text-center py-4 text-gray-400">
                Unable to display PDF. <a href={user?.resume_url || ''} className="text-blue-400 hover:underline">Download instead</a>
              </p>
            </object>
          </div>
        </DialogContent>
      </Dialog>
      <EditProfile 
        onClose={() => setIsEditModalOpen(false)} 
        isOpen={isEditModalOpen} 
        user={user} 
        onSave={handleSave}
      />
    </div>
  );  
};

export default ProfileComponent;