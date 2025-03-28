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
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from '../ui/dialog';
import ConnectionButtons from './ConnectionButtons';
import ConnectionCount from './ConnectionCount';
import PostsGrid from '../Posts/PostGrid';
import PostCount from '../Posts/PostCount';

interface ProfileComponentProps {
  username: string;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ username }) => {
  const dispatch: AppDispatch = useDispatch();
  const {  user, loading, ownAccount } = useSelector((state: RootState) => state.userAuth);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const handleSave = async (userData: any) => {
    console.log("userData", userData)
    const response = await axiosInstance.post('/updateProfile', userData);
    console.log(response);
  };
  
  useEffect(() => {
    console.log("to check profile picture",user);
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
      const response = await axiosInstance.get('/getSignedUploadUrl');
      console.log(response);
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

      const updateDbWithUrlRespone = await axiosInstance.post('/uploadIntroductionVideo', {videoUrl:uploadResponse.data.secure_url}) ;
      console.log("updateDbWithUrlRespone", updateDbWithUrlRespone);
      
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

  const renderMediaSection = () => {
    if (!user?.video_url && !user?.resume_url) return null;

    return (
      <div className="mt-8 flex flex-wrap gap-4">
        {user?.video_url && (
          <>
            <Button
              onClick={() => setShowVideoModal(true)}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <Video size={18} className="mr-2 text-blue-400" />
              View Introduction Video
            </Button>

            <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
              <DialogContent className="max-w-4xl bg-gray-800 text-white border-gray-700">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Video size={18} className="text-blue-400" />
                    Introduction Video
                  </DialogTitle>
                </DialogHeader>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                  <VideoPlayer src={user.video_url} />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {user?.resume_url && (
          <>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResumeModal(true)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                <FileText size={18} className="mr-2 text-blue-400" />
                View Resume
              </Button>

              <Button
            onClick={() => {
              if (user?.resume_url) {
                window.open(user.resume_url, '_blank');
              } else {
                alert('Resume URL is not available.');
              }
            }}
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          >
            <Download size={18} className="mr-2 text-blue-400" />
            Download Resume
          </Button>

            </div>

            <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
              <DialogContent className="max-w-full w-full mr-12 bg-gray-800 text-white border-gray-700">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText size={18} className="text-blue-400" />
                    Resume
                  </DialogTitle>
                </DialogHeader>
                <div className="h-full w-full rounded-lg overflow-hidden bg-gray-900">
                  <object
                    data={`https://docs.google.com/viewer?url=${encodeURIComponent(user.resume_url)}&embedded=true`}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <p className="text-center py-4 text-gray-400">
                      Unable to display PDF. <a href={user.resume_url} className="text-blue-400 hover:underline">Download instead</a>
                    </p>
                  </object>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    );
  };


  return (
    <div className="max-w-4xl mx-auto text-white bg-secondary">
      <div className="relative">
        <div className="h-32 w-full bg-gradient-to-r from-blue-400 to-blue-100 rounded-t-lg"></div>
        <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-[#1a1a2e] bg-purple-300 overflow-hidden">
            <img 
              src={user?.profile_picture || 'https://img.freepik.com/premium-vector/user-circle-with-blue-gradient-circle_78370-4727.jpg'} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
            </div>
        </div>
      </div>

      <div className="mt-20 px-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-400 text-sm">{user?.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
              Brototype
            </button>
            {ownAccount && (
              <>
                <Button
                  className="p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 size={20} />
                </Button>
              </>
            )}
          </div>
        </div>
        {renderMediaSection()}
        {ownAccount && (
          <div className="mt-6">
            {!showUploadModal ? (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Camera size={16} />
                Upload Introduction Video
              </button>
            ) : (
              <div className="mt-4 p-6 border border-gray-700 rounded-lg bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Upload Introduction Video</h3>
                  <button 
                    onClick={() => {
                      setShowUploadModal(false);
                      cancelUpload();
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {video ? (
                  <div className="mb-4 relative aspect-video">
                  <VideoPlayer 
                    src={video}
                  />
                </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors mb-4 bg-gray-900"
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
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
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
                    <button
                      onClick={cancelUpload}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                    >
                      Cancel Upload
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          cancelUpload();
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      
                      {video && (
                        <button
                          onClick={() => setShowUploadModal(false)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                        >
                          Save Video
                        </button>
                      )}
                      
                      {!video && (
                        <button
                          onClick={triggerFileInput}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        >
                          Select Video
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )} <div className="bg-secondary rounded-lg flex items-center justify-between shadow-md mt-4 mb-4">
        <div className="flex-grow pr-4">
          <h3 className="text-white font-semibold mb-2">About Me</h3>
          <div className="text-gray-400 text-sm leading-relaxed">
            <p>Lorem Ipsum is simply dummy text of</p>
            <p>the printing and typesetting industry.</p>
            <p>Lorem Ipsum</p>
          </div>
        </div>
        <ConnectionButtons/>
      </div>
        <div className="flex gap-6 mt-4 text-sm">
          <ConnectionCount/>
          <PostCount/>
        </div>

        <div className="flex border-b border-gray-800 mt-8">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-white">
            POSTS
          </button>
        </div>
        <PostsGrid/>
      </div>

      <EditProfile 
        onClose={() => setIsEditModalOpen(false)} 
        isOpen={isEditModalOpen} 
        user={user} 
        onSave={handleSave as (userData: any) => Promise<void>}
      />
    </div>
  );  
};

export default ProfileComponent;