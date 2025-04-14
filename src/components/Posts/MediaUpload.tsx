import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Hash,
  AlertCircle,
  CheckCircle,
  Info,
  Edit2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ImageEditor from './ImageEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import axiosInstance from '@/services/api/userInstance';
import axios from 'axios';

const MediaUpload: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaSize, setMediaSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHoveringMedia, setIsHoveringMedia] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE: number = 10 * 1024 * 1024;
  const MAX_TAGS: number = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleMedia(file);
  };

  const handleMedia = (file: File): void => {
    const fileType = file.type.split('/')[0];

    if (fileType !== 'image' && fileType !== 'video') {
      toast.error('Invalid file type', {
        description: 'Please upload an image or video file.',
        icon: <AlertCircle className="text-red-500" />,
        duration: 5000,
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.warning('File is too large', {
        description: `Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        icon: <AlertCircle className="text-yellow-500" />,
        duration: 5000,
      });
      return;
    }

    setMediaType(fileType as 'image' | 'video');
    setMediaSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
      toast.success("Media uploaded successfully", {
        description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} has been added to your post.`,
        icon: <CheckCircle className="text-green-500" />,
        duration: 3000,
      });
    };
    reader.onerror = () => {
      toast.error('Failed to read file', {
        description: 'Please try again.',
        icon: <AlertCircle className="text-red-500" />,
        duration: 5000,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleMedia(file);
    }
  };

  const handleRemoveMedia = (): void => {
    setMediaPreview(null);
    setMediaType(null);
    setMediaSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info("Media removed", {
      description: 'Your media has been removed from the post.',
      icon: <X className="text-blue-500" />,
      duration: 3000,
    });
  };

  const handleOpenEditor = (): void => {
    if (mediaType === 'image' && mediaPreview) {
      setIsEditorOpen(true);
    }
  };

  const handleSaveEditedImage = (editedImageDataUrl: string): void => {
    setMediaPreview(editedImageDataUrl);
    setIsEditorOpen(false);
    toast.success("Image edited successfully", {
      description: "Your changes have been applied to the image.",
      icon: <CheckCircle className="text-green-500" />,
      duration: 3000,
    });
  };

  // const handleCancelEdit = (): void => {
  //   setIsEditorOpen(false);
  //   toast.info("Edit cancelled", {
  //     description: "No changes were made to your image.",
  //     icon: <Info className="text-blue-500" />,
  //     duration: 3000,
  //   });
  // };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();

      // Check max tags
      if (tags.length >= MAX_TAGS) {
        toast.warning('Maximum tags reached', {
          description: `You can only add up to ${MAX_TAGS} tags.`,
          icon: <AlertCircle className="text-yellow-500" />,
          duration: 3000,
        });
        return;
      }

      // Check if tag already exists
      if (tags.includes(tagInput.trim())) {
        toast.info('Tag already exists', {
          description: 'This tag has already been added.',
          icon: <Info className="text-blue-500" />,
          duration: 3000,
        });
        return;
      }

      setTags([...tags, tagInput.trim()]);
      setTagInput('');

      toast.success(`Tag added`, {
        description: `#${tagInput.trim()} has been added to your post.`,
        icon: <Hash className="text-blue-500" />,
        duration: 3000,
      });
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    toast.info("Tag removed", {
      description: `#${tagToRemove} has been removed from your post.`,
      icon: <X className="text-blue-500" />,
      duration: 3000,
    });
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Check for media
    if (!mediaPreview) {
      toast.error('Media required', {
        description: 'Please upload a media file.',
        icon: <AlertCircle className="text-red-500" />,
        duration: 5000,
      });
      isValid = false;
    }

    // Check for title
    if (!title.trim()) {
      toast.error('Title required', {
        description: 'Please enter a title for your post.',
        icon: <AlertCircle className="text-red-500" />,
        duration: 5000,
      });
      isValid = false;
    }

    return isValid;
  };

  const base64ToBlob = (base64: string) => {
    const match = base64.match(/^data:(image|video)\/([a-zA-Z0-9]+);base64,/);
    if (!match) throw new Error("Invalid base64 format");
  
    const fileType = `${match[1]}/${match[2]}`;
    console.log(fileType);
    const fileExtension = match[2];
  
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Uint8Array(byteCharacters.length).map((_, i) => byteCharacters.charCodeAt(i));
  
    return {
      file: new File([byteNumbers], `upload.${fileExtension}`, { type: fileType }),
      fileType,
    };
  };
  
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    try {
      if (!mediaPreview) {
        throw new Error("No media selected");
      }
  
      let fileToUpload: { file: File; fileType: string };
  
      if (typeof mediaPreview === "string" && mediaPreview.startsWith("data:")) {
        fileToUpload = base64ToBlob(mediaPreview);
      } else {
        throw new Error("Invalid media format");
      }
  
      const isVideo = fileToUpload.fileType.startsWith("video");
  
      const formData = new FormData();
      formData.append("file", fileToUpload.file);
  
      const response = await axiosInstance.get("/getSignedUploadUrl", {
        params: { resource_type: isVideo ? "video" : "image" },
      });
  
      console.log("Signed URL Response:", response);
  
      const { signature, timestamp, upload_url, api_key } = response.data.signedUrl;
      if (!signature || !timestamp || !upload_url || !api_key) {
        throw new Error("Invalid upload credentials received");
      }
  
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
  
      const uploadResponse = await axios.post(upload_url, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log("Upload Progress:", percentCompleted);
        },
      });
  
      console.log("Upload Response:", uploadResponse.data);
      const uploadedMediaUrl = uploadResponse.data.secure_url;
  
      const post = {
        title,
        description,
        tags,
        media: uploadedMediaUrl,
      };
  
      const postResponse = await axiosInstance.post("/post", post);
      console.log("Post Created:", postResponse.data);
  
      toast.success("Post published successfully!", {
        description: "Your content is now live.",
        icon: <CheckCircle className="text-green-500" />,
        duration: 5000,
      });
  
      setTitle("");
      setDescription("");
      setTags([]);
      setMediaPreview(null);
      setMediaType(null);
      setMediaSize(0);
      setIsLoading(false);
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Upload failed. Please try again.");
      setIsLoading(false);
    }
  };
  
  

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Card className="bg-secondary text-white">
      <CardHeader>
        <CardTitle className="text-white">Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        {!mediaPreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed ${
              isDragging ? 'border-blue-400' : 'border-gray-600'
            } p-6 text-center cursor-pointer rounded-md transition-colors duration-300 text-gray-300 hover:border-blue-500`}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Drag and drop your media here, or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />
            <p className="text-sm text-gray-400 mt-2">
              Supports images and videos (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div
              className="rounded-md overflow-hidden mb-3 border border-gray-700 relative"
              style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={() => setIsHoveringMedia(true)}
              onMouseLeave={() => setIsHoveringMedia(false)}
            >
              {mediaType === 'image' ? (
                <>
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                  {isHoveringMedia && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xs bg-opacity-50 flex items-center justify-center transition-opacity duration-200">
                      <Button 
                        onClick={handleOpenEditor}
                        variant="default" 
                        className="bg-gray-600 hover:bg-gray-700 cursor-pointer"
                      >
                        <Edit2 className="mr-2 h-4 w-4" /> Edit Image
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <video
                  controls
                  src={mediaPreview}
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{formatFileSize(mediaSize)}</span>
              <Button
                onClick={handleRemoveMedia}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="mr-2 h-4 w-4" /> Remove Media
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="title" className="text-gray-200">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1"
              placeholder="Enter a title for your post"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-200">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white resize-none min-h-24 mt-1"
              placeholder="Add a description (optional)"
            />
          </div>
          <div>
            <Label className="text-gray-200 flex justify-between">
              <span>Tags</span>
              <span className="text-sm text-gray-400">{tags.length}/{MAX_TAGS}</span>
            </Label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white mt-1"
              placeholder="Type a tag and press Enter"
              disabled={tags.length >= MAX_TAGS}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} className="bg-blue-800 text-white py-1 px-3 flex items-center gap-1">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-300 hover:text-white"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-gray-800 pt-4">
        <div className="text-sm text-gray-400">
          {!mediaPreview && "Media required"}
          {mediaPreview && !title.trim() && "Title required"}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !mediaPreview || !title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" /> Posting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Post
            </>
          )}
        </Button>
      </CardFooter>

      {/* Image Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="bg-gray-900 text-white max-w-screen-xl w-11/12 h-auto max-h-screen overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adjust your image before posting
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-150 w-full overflow-y-auto">
            {mediaPreview && (
              <ImageEditor
              initialImage={mediaPreview}
                onSave={handleSaveEditedImage}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MediaUpload;