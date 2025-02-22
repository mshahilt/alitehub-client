import { useState, useEffect } from 'react';
import { X, Upload, User, Briefcase, GraduationCap, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
interface UserProfile {
  name: string;
  username: string;
  email: string;
  contact: {
    phone: string | null; 
  };
  profile_picture: string | null;
  job_types: string[];
  industries: string[];
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
}

const DEFAULT_EDUCATION = {
  institution: '',
  degree: '',
  field: '',
  start_date: '',
  end_date: ''
};

const DEFAULT_EXPERIENCE = {
  company: '',
  title:'',
  position: '',
  start_date: '',
  end_date: '',
  description: ''
};

const INITIAL_STATE: UserProfile = {
  name: '',
  username: '',
  email: '',
  contact: { phone: '' },
  profile_picture: '',
  job_types: [],
  industries: [],
  skills: [],
  education: [],
  experience: []
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Partial<UserProfile>;
  onSave: (userData: UserProfile) => Promise<void>;
}

const EditProfile = ({ isOpen, onClose, user, onSave }: ProfileModalProps) => {
  const [userData, setUserData] = useState<UserProfile>(() => {
    return {
      ...INITIAL_STATE,
      ...user,
      contact: { ...INITIAL_STATE.contact, ...user?.contact },
      job_types: user?.job_types || [],
      industries: user?.industries || [],
      skills: user?.skills || [],
      education: user?.education || [],
      experience: user?.experience || []
    };
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (user) {
      setUserData(prevData => ({
        ...prevData,
        ...user,
        contact: { ...prevData.contact, ...user.contact },
        job_types: user.job_types || prevData.job_types,
        industries: user.industries || prevData.industries,
        skills: user.skills || prevData.skills,
        education: user.education || prevData.education,
        experience: user.experience || prevData.experience
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (!userData.email?.trim()) newErrors.email = 'Email is required';
    if (!userData.username?.trim()) newErrors.username = 'Username is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email && !emailRegex.test(userData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (userData.contact.phone && !phoneRegex.test(userData.contact.phone)) {
      newErrors.contact = 'Invalid phone format';
    }

    const eduErrors = userData.education.some(edu => 
      !edu.institution?.trim() || !edu.degree?.trim() || !edu.field?.trim()
    );
    if (eduErrors) {
      newErrors.education = 'All education fields are required';
    }

    const expErrors = userData.experience.some(exp => 
      !exp.company?.trim() || !exp.title?.trim() || !exp.description?.trim()
    );
    if (expErrors) {
      newErrors.experience = 'All experience fields are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContactChange = (value: string) => {
    setUserData(prev => ({
      ...prev,
      contact: { ...prev.contact, phone: value }
    }));
    if (errors.contact) {
      setErrors(prev => ({ ...prev, contact: undefined }));
    }
  };

  const addToArray = (field: 'skills' | 'job_types' | 'industries', value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !userData[field].includes(trimmedValue)) {
      setUserData(prev => ({
        ...prev,
        [field]: [...prev[field], trimmedValue]
      }));
    }
  };

  const removeFromArray = (field: 'skills' | 'job_types' | 'industries', index: number) => {
    setUserData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setUserData(prev => ({
      ...prev,
      education: [...prev.education, { ...DEFAULT_EDUCATION }]
    }));
  };

  const addExperience = () => {
    setUserData(prev => ({
      ...prev,
      experience: [...prev.experience, { ...DEFAULT_EXPERIENCE }]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('profile_picture', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log('save clicked')
    if (!validateForm()) {
      console.log('form validation failed')
      const errorFields = Object.keys(errors);
      if (errorFields.includes('email') || errorFields.includes('username')) {
        setActiveTab('basic');
      } else if (errorFields.includes('education')) {
        setActiveTab('education');
      } else if (errorFields.includes('experience')) {
        setActiveTab('experience');
      }
      return;
    }

    try {
      setIsSaving(true);
      console.log("nammal jaychu",userData)
      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save profile' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen bg-primary text-white overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative">
          <TabsList className="grid w-full grid-cols-4 bg-secondary top-0 sticky">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Basic
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="w-4 h-4" /> Skills
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Education
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Experience
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-32 h-32 c">
                <AvatarImage src={userData?.profile_picture || undefined}/>
                  <AvatarFallback>
                    <User color='grey' className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-picture" className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    id="profile-picture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Button size="icon" className="rounded-full">
                    <Upload className="w-4 h-4" />
                  </Button>
                </label>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Input
                  placeholder="Username"
                  value={userData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={userData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={userData?.contact?.phone || undefined}
                  onChange={(e) => handleContactChange(e.target.value)}
                  className={errors.contact ? "border-red-500" : ""}
                />
                {errors.contact && (
                  <p className="text-sm text-red-500">{errors.contact}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 ">
            {["skills", "job_types", "industries"].map((field) => (
              <Card key={field} className='bg-secondary rounded-2xl text-white'>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {field.replace("_", " ")}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userData[field as keyof Pick<UserProfile, 'skills' | 'job_types' | 'industries'>].map((item, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 bg-gray-300 hover:bg-gray-500">
                        {item}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeFromArray(field as 'skills' | 'job_types' | 'industries', index)}
                        >
                          <X className=" h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${field.replace("_", " ")}`}
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSkill) {
                          addToArray(field as 'skills' | 'job_types' | 'industries', newSkill);
                          setNewSkill("");
                        }
                      }}
                    />
                    <Button
                    className='cursor-pointer'
                      onClick={() => {
                        if (newSkill) {
                          addToArray(field as 'skills' | 'job_types' | 'industries', newSkill);
                          setNewSkill("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
          {errors.education && (
              <p className="text-sm text-red-500 mb-2">{errors.education}</p>
            )}
            {userData.education?.map((edu, index) => (
              <Card key={index} className='bg-secondary text-white'>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      placeholder="Institution"
                      value={edu.institution || ""}
                      onChange={(e) => {
                        const newEducation = [...userData.education];
                        newEducation[index] = { ...edu, institution: e.target.value };
                        handleInputChange("education", newEducation);
                      }}
                    />
                    <Input
                      placeholder="Degree"
                      value={edu.degree || ""}
                      onChange={(e) => {
                        const newEducation = [...userData.education];
                        newEducation[index] = { ...edu, degree: e.target.value };
                        handleInputChange("education", newEducation);
                      }}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={edu.field || ""}
                      onChange={(e) => {
                        const newEducation = [...userData.education];
                        newEducation[index] = { ...edu, field: e.target.value };
                        handleInputChange("education", newEducation);
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Start Year"
                        value={edu.start_date || ""}
                        onChange={(e) => {
                          const newEducation = [...userData.education];
                          newEducation[index] = { ...edu, start_date: e.target.value };
                          handleInputChange("education", newEducation);
                        }}
                      />
                      <Input
                        placeholder="End Year"
                        value={edu.end_date || ""}
                        onChange={(e) => {
                          const newEducation = [...userData.education];
                          newEducation[index] = { ...edu, end_date: e.target.value };
                          handleInputChange("education", newEducation);
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const newEducation = userData.education.filter((_, i) => i !== index);
                      handleInputChange("education", newEducation);
                    }}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className='bg-secondary' onClick={addEducation}>Add Education</Button>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            {userData.experience?.map((exp, index) => (
              <Card key={index} className='bg-secondary text-white'>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      placeholder="Company"
                      value={exp.company || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, company: e.target.value };
                        handleInputChange("experience", newExperience);
                      }}
                    />
                    <Input
                      placeholder="Position"
                      value={exp.title || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, title: e.target.value };
                        handleInputChange("experience", newExperience);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Start Date"
                      value={exp.start_date || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, start_date: e.target.value };
                        handleInputChange("experience", newExperience);
                      }}
                    />
                    <Input
                      placeholder="End Date"
                      value={exp.end_date || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, end_date: e.target.value };
                        handleInputChange("experience", newExperience);
                      }}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={exp.description || ""}
                    onChange={(e) => {
                      const newExperience = [...userData.experience];
                      newExperience[index] = { ...exp, description: e.target.value };
                      handleInputChange("experience", newExperience);
                    }}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const newExperience = userData.experience.filter((_, i) => i !== index);
                      handleInputChange("experience", newExperience);
                    }}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className='bg-secondary' onClick={addExperience}>Add Experience</Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" className='bg-secondary' onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className='bg-black border border-white cursor-pointer'>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;