import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Upload, User, Briefcase, GraduationCap, Award, FileText, Loader2, BookCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axiosInstance from '@/services/api/userInstance';
import axios from 'axios';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  about: string;
  contact: { phone: string | null };
  profile_picture: string | null;
  resume_url: string | null;
  skills: string[];
  education: Array<{ institution: string; degree: string; field: string; start_date: string; end_date: string }>;
  experience: Array<{ company: string; title: string; start_date: string; end_date: string; description: string }>;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Partial<UserProfile>;
  onSave: (userData: Partial<UserProfile>) => Promise<void>;
}

interface Skill {
  id: string;
  name: string;
  type: { id: string; name: string };
  infoUrl: string;
}

interface ResumeFile {
  file: File;
  preview?: string;
}

const DEFAULT_EDUCATION = { institution: '', degree: '', field: '', start_date: '', end_date: '' };
const DEFAULT_EXPERIENCE = { company: '', title: '', start_date: '', end_date: '', description: '' };
const INITIAL_STATE: UserProfile = {
  id: "", name: '', username: '',about: '', email: '', contact: { phone: '' }, profile_picture: '', resume_url: "", 
  skills: [], education: [], experience: []
};

const EditProfile = ({ isOpen, onClose, user, onSave }: ProfileModalProps) => {
  const [userData, setUserData] = useState<UserProfile>(() => ({
    ...INITIAL_STATE,
    ...user,
    contact: { ...INITIAL_STATE.contact, ...user?.contact },
    skills: user?.skills || [],
    education: user?.education || [],
    experience: user?.experience || []
  }));
  const [selectedResume, setSelectedResume] = useState<ResumeFile | null>(null);
  const [resumeDialog, setResumeDialog] = useState({ isOpen: false, isUploading: false });
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillsSuggestions, setSkillsSuggestions] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillsPopoverOpen, setSkillsPopoverOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile | 'submit', string>>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  
  const focusedFieldRef = useRef<{
    section: "education" | "experience",
    index: number,
    field: string
  } | null>(null);

  const fetchSkills = useCallback(
    ((query: string) => {
      const handler = setTimeout(async () => {
        if (!query.trim()) {
          setSkillsSuggestions([]);
          setSkillsPopoverOpen(false);
          return;
        }
        setLoadingSkills(true);
        try {
          const response = await axiosInstance.get<Skill[]>(`/job/skills?query=${encodeURIComponent(query)}`);
          setSkillsSuggestions(response.data || []);
          setSkillsPopoverOpen(true);
        } catch (error) {
          console.error("Error fetching skills:", error);
          setSkillsSuggestions([]);
        } finally {
          setLoadingSkills(false);
        }
      }, 300);
      return () => clearTimeout(handler);
    }), []
  );

  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev, ...user,
        contact: { ...prev.contact, ...user.contact },
        skills: user.skills || prev.skills,
        education: user.education || prev.education,
        experience: user.experience || prev.experience
      }));
    }
  }, [user]);

  useEffect(() => {
    const handler = fetchSkills(newSkill);
    return () => handler();
  }, [newSkill, fetchSkills]);

  useEffect(() => {
    if (focusedFieldRef.current) {
      const { section, index, field } = focusedFieldRef.current;
      const selector = `#${section}-${index}-${field}`;
      const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
      if (element) {
        const cursorPosition = element.value.length;
        element.focus();
        element.setSelectionRange(cursorPosition, cursorPosition);
      }
      focusedFieldRef.current = null;
    }
  });

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};
    if (!userData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) newErrors.email = 'Invalid email format';
    if (!userData.username?.trim()) newErrors.username = 'Username is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  const handleEducationChange = (index: number, field: string, value: string) => {
    focusedFieldRef.current = { section: "education", index, field };
    
    const newEducation = [...userData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    handleInputChange("education", newEducation);
  };
  
  const handleExperienceChange = (index: number, field: string, value: string) => {
    // Store the field that's currently being edited
    focusedFieldRef.current = { section: "experience", index, field };
    
    const newExperience = [...userData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    handleInputChange("experience", newExperience);
  };

  const addSkill = (skillName: string) => {
    const trimmedSkill = skillName.trim();
    if (trimmedSkill && !userData.skills.includes(trimmedSkill)) {
      setUserData(prev => ({ ...prev, skills: [...prev.skills, trimmedSkill] }));
    }
    setNewSkill("");
    setSkillsPopoverOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const file = files[0];
    try {
      setLoading(true);
      const signedUrlResponse = await axiosInstance.get('/getSignedUploadUrl', {
        params: { resource_type: 'image' },
      });
  
      const { signedUrl } = signedUrlResponse.data;
      if (!signedUrl || !signedUrl.upload_url) {
        throw new Error("Invalid signed URL response");
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signedUrl.api_key);
      formData.append("timestamp", signedUrl.timestamp.toString());
      formData.append("signature", signedUrl.signature);
  
      const uploadUrl = signedUrl.upload_url;
      const cloudinaryResponse = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const imageUrl = cloudinaryResponse.data.secure_url;
      if (imageUrl) {
        setUserData(prev => ({
          ...prev,
          profile_picture: imageUrl,
        }));
      } else {
        alert("Failed to upload image to Cloudinary");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image to Cloudinary");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedResume({ file, preview: URL.createObjectURL(file) });
      setResumeDialog({ ...resumeDialog, isOpen: true });
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleResumeUpload = async () => {
    if (!selectedResume?.file) return;
    setResumeDialog(prev => ({ ...prev, isUploading: true }));
    const formData = new FormData();
    formData.append("pdf", selectedResume.file);
    try {
      const response = await axiosInstance.post<{ fileUrl: string }>("uploadResume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      handleInputChange('resume_url', response.data.fileUrl);
      URL.revokeObjectURL(selectedResume.preview || '');
      setSelectedResume(null);
      setResumeDialog({ isOpen: false, isUploading: false });
    } catch (error) {
      console.error("Error uploading file:", error);
      setResumeDialog(prev => ({ ...prev, isUploading: false }));
    }
  };
 
  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save profile' }));
    } finally {
      setIsSaving(false);
    }
  };

  const EducationCard = ({ edu, index }: { edu: any, index: number }) => (
    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-l-blue-600 shadow-lg rounded-lg overflow-hidden text-white">
      <CardContent className="pt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Input 
            id={`education-${index}-institution`}
            placeholder="Institution" 
            value={edu.institution}
            onChange={e => handleEducationChange(index, "institution", e.target.value)}
            className="bg-black/40 border-gray-700"
          />
          <Input 
            id={`education-${index}-degree`}
            placeholder="Degree" 
            value={edu.degree}
            onChange={e => handleEducationChange(index, "degree", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
        </div>
        <Input 
          id={`education-${index}-field`}
          placeholder="Field of Study" 
          value={edu.field}
          onChange={e => handleEducationChange(index, "field", e.target.value)}
          className="bg-black/40 border-gray-700" 
        />
        <div className="grid grid-cols-2 gap-2">
          <Input 
            id={`education-${index}-start_date`}
            placeholder="Start Year" 
            value={edu.start_date}
            onChange={e => handleEducationChange(index, "start_date", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
          <Input 
            id={`education-${index}-end_date`}
            placeholder="End Year (or Expected)" 
            value={edu.end_date}
            onChange={e => handleEducationChange(index, "end_date", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
        </div>
        <Button variant="destructive" size="sm" className="w-24 mt-1"
          onClick={() => {
            const newEdu = userData.education.filter((_, i) => i !== index);
            handleInputChange("education", newEdu);
          }}
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );

  const ExperienceCard = ({ exp, index }: { exp: any, index: number }) => (
    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-l-purple-600 shadow-lg rounded-lg overflow-hidden text-white">
      <CardContent className="pt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Input 
            id={`experience-${index}-company`}
            placeholder="Company" 
            value={exp.company}
            onChange={e => handleExperienceChange(index, "company", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
          <Input 
            id={`experience-${index}-title`}
            placeholder="Job Title" 
            value={exp.title}
            onChange={e => handleExperienceChange(index, "title", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input 
            id={`experience-${index}-start_date`}
            placeholder="Start Date" 
            value={exp.start_date}
            onChange={e => handleExperienceChange(index, "start_date", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
          <Input 
            id={`experience-${index}-end_date`}
            placeholder="End Date (or Present)" 
            value={exp.end_date}
            onChange={e => handleExperienceChange(index, "end_date", e.target.value)}
            className="bg-black/40 border-gray-700" 
          />
        </div>
        <Textarea 
          id={`experience-${index}-description`}
          placeholder="Job Description" 
          value={exp.description}
          onChange={e => handleExperienceChange(index, "description", e.target.value)}
          className="min-h-20 bg-black/40 border-gray-700"
        />
        <Button variant="destructive" size="sm" className="w-24 mt-1"
          onClick={() => {
            const newExp = userData.experience.filter((_, i) => i !== index);
            handleInputChange("experience", newExp);
          }}
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl h-[90vh] overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white flex flex-col border border-gray-800 rounded-xl shadow-xl">
        <DialogHeader className="pb-2 border-b border-gray-800">
          <DialogTitle className="text-xl font-bold tracking-tight">Edit Your Profile</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-4 sticky top-0 z-10 bg-black/60 backdrop-blur-md rounded-md mt-2">
            <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"><User className="w-4 h-4 mr-2" /> Basic</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"><Award className="w-4 h-4 mr-2" /> Skills</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400"><GraduationCap className="w-4 h-4 mr-2" /> Education</TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400"><Briefcase className="w-4 h-4 mr-2" /> Experience</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pr-4">
          <ScrollArea className="max-h-48">

          <TabsContent value="basic" className="space-y-4 mt-2 pb-4">
  <div className="flex justify-center mb-6">
    <div className="relative group">
      <Avatar className="w-28 h-28 ring-2 ring-blue-500/50 group-hover:ring-blue-500 transition-all duration-300">
        <AvatarImage src={userData.profile_picture ?? ""} />
        <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900">
          <User className="w-10 h-10 text-gray-300" />
        </AvatarFallback>
      </Avatar>
      <label htmlFor="profile-picture" className="absolute -bottom-2 -right-2 cursor-pointer">
        <Button
          size="icon"
          variant="default"
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all"
          disabled={loading}
          asChild
        >
          <span>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
        </Button>
        <input
          type="file"
          id="profile-picture"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleImageUpload} 
        />
      </label>
    </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <div>
      <Input 
        placeholder="Username" 
        value={userData.username} 
        onChange={(e) => handleInputChange("username", e.target.value)} 
        className={`bg-black/40 border-gray-700 focus:border-blue-500 transition-colors ${errors.username ? "border-red-500" : ""}`}
      />
      {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
    </div>
    <div>
      <Input 
        type="email" 
        placeholder="Email" 
        value={userData.email} 
        onChange={(e) => handleInputChange("email", e.target.value)} 
        className={`bg-black/40 border-gray-700 focus:border-blue-500 transition-colors ${errors.email ? "border-red-500" : ""}`}
      />
      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
    </div>
    <Input 
      type="tel" 
      placeholder="Phone" 
      value={userData.contact.phone ?? ""} 
      onChange={(e) => handleInputChange("contact", { phone: e.target.value })} 
      className="bg-black/40 border-gray-700 focus:border-blue-500 transition-colors"
    />
  </div>

  <div className="mt-6">
    <h3 className="text-sm font-medium mb-2 text-blue-400">About</h3>
    <textarea
      placeholder="Tell us about yourself"
      value={userData.about ?? ""}
      onChange={(e) => handleInputChange("about", e.target.value)}
      className={`w-full h-24 p-3 bg-black/40 border border-gray-700 rounded-md focus:border-blue-500 transition-colors resize-none ${
        errors.about ? "border-red-500" : ""
      }`}
    />
    {errors.about && <p className="text-xs text-red-400 mt-1">{errors.about}</p>}
  </div>

  <div className="mt-6">
    <h3 className="text-sm font-medium mb-2 text-blue-400">{userData.resume_url ? "Resume" : "Upload Resume (PDF)"}</h3>
    <div className="border border-gray-700 rounded-lg p-4 text-center bg-black/30 hover:bg-black/40 transition-colors">
      {userData.resume_url && (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(userData.resume_url)}&embedded=true`}
          className="w-full h-32 border border-gray-700 rounded mb-3"
          title="Resume Preview"
        />
      )}
      <input type="file" id="resume" className="hidden" accept="application/pdf" onChange={handleResumeSelect} />
      <label htmlFor="resume" className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-colors">
        <FileText className="w-5 h-5" />
        <span>{userData.resume_url ? "Update Resume" : "Upload Resume"}</span>
      </label>
    </div>
  </div>
</TabsContent>
</ScrollArea>

            <TabsContent value="skills" className="space-y-4 mt-2 pb-4">
              <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-none shadow-md">
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2 mb-4 min-h-16 bg-black/20 p-3 rounded-lg border border-gray-800">
                    {userData.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-green-900/30 hover:bg-green-900/50 text-white border-green-500/30">
                        {skill}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1 opacity-70 hover:opacity-100" 
                          onClick={() => setUserData(prev => ({ 
                            ...prev, skills: prev.skills.filter((_, i) => i !== index) 
                          }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {userData.skills.length === 0 && (
                      <span className="text-gray-500 text-sm">Add skills to showcase your expertise</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Popover open={skillsPopoverOpen} onOpenChange={setSkillsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative flex-1 bg-dark text-white">
                          <Input
                            placeholder="Add skills (e.g., React, Python, UX Design)"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && newSkill.trim() && addSkill(newSkill)}
                            className="bg-black/40 border-gray-700 focus:border-green-500 transition-colors"
                          />
                          {loadingSkills && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 animate-spin -translate-y-1/2 text-white" />}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-1 bg-gray-900 text-white border border-gray-700">
                        <ScrollArea className="max-h-48">
                          {skillsSuggestions.length > 0 ? (
                            skillsSuggestions.map((skill) => (
                              <div
                                key={skill.id}
                                className="cursor-pointer p-2 hover:bg-green-900/30 rounded text-sm"
                                onClick={() => addSkill(skill.name)}
                              >
                                {skill.name}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 p-2 text-sm">{newSkill ? "No skills found" : "Start typing to search"}</p>
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Button onClick={() => newSkill.trim() && addSkill(newSkill)} disabled={!newSkill.trim()} className="bg-green-600 hover:bg-green-700">Add</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-3 mt-2 pb-4">
              {userData.education.map((edu, index) => (
                <EducationCard key={index} edu={edu} index={index} />
              ))}
              <Button variant="outline" className="mt-2 bg-black/40 border-purple-500/50 text-purple-400 hover:bg-purple-900/20" onClick={() => handleInputChange("education", [...userData.education, { ...DEFAULT_EDUCATION }])}>
                <GraduationCap className="w-4 h-4 mr-2" /> Add Education
              </Button>
            </TabsContent>

            <TabsContent value="experience" className="space-y-3 mt-2 pb-4">
              {userData.experience.map((exp, index) => (
                <ExperienceCard key={index} exp={exp} index={index} />
              ))}
              <Button variant="outline" className="mt-2 bg-black/40 border-amber-500/50 text-amber-400 hover:bg-amber-900/20" onClick={() => handleInputChange("experience", [...userData.experience, { ...DEFAULT_EXPERIENCE }])}>
                <Briefcase className="w-4 h-4 mr-2" /> Add Experience
              </Button>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Dialog open={resumeDialog.isOpen} onOpenChange={(open) => {
          if (!open) {
            URL.revokeObjectURL(selectedResume?.preview || '');
            setSelectedResume(null);
          }
          setResumeDialog(prev => ({ ...prev, isOpen: open }));
        }}>
          <DialogContent className="max-w-md bg-gradient-to-b from-gray-900 to-black text-white border border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Resume Preview</DialogTitle>
            </DialogHeader>
            {selectedResume && (
              <div className="space-y-4">
                <div className="p-3 bg-black/40 border border-gray-700 rounded-md flex items-center gap-3">
                  <FileText className="text-blue-400" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{selectedResume.file.name}</p>
                    <p className="text-xs opacity-70">{(selectedResume.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                {selectedResume.preview && <iframe src={selectedResume.preview} className="w-full h-80 border border-gray-700 rounded" title="Resume Preview" />}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={() => setResumeDialog({ isOpen: false, isUploading: false })} disabled={resumeDialog.isUploading} className="bg-black hover:bg-gray-900">
                Cancel
              </Button>
              <Button onClick={handleResumeUpload} disabled={resumeDialog.isUploading || !selectedResume} className="bg-blue-600 hover:bg-blue-700">
                {resumeDialog.isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookCheck className="w-4 h-4 mr-2" />}
                {resumeDialog.isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex justify-end gap-2 pt-4 mt-auto border-t border-gray-800">
          <Button variant="outline" className="bg-black hover:bg-gray-900 border-gray-700" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
        {errors.submit && <p className="text-sm text-red-500 mt-1 text-center">{errors.submit}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;