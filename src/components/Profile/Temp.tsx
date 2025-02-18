import React, { useState } from 'react';
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
  name: string | null;
  username: string | null;
  email: string | null;
  contact: {
    phone: string | null;
  };
  profile_picture: string | null;
  job_types: string[];
  industries: string[];
  skills: string[];
  education: Array<{
    institution: string | null;
    degree: string | null;
    field: string | null;
    startYear: string | null;
    endYear: string | null;
  }>;
  experience: Array<{
    company: string | null;
    position: string | null;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
  }>;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (userData: UserProfile) => Promise<void>;
}

const EditProfile = ({ isOpen, onClose, user, onSave }: ProfileModalProps) => {
  const [userData, setUserData] = useState<UserProfile>(user);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (value: string) => {
    setUserData(prev => ({
      ...prev,
      contact: { ...prev.contact, phone: value }
    }));
  };

  const addToArray = (field: 'skills' | 'job_types' | 'industries', value: string) => {
    if (value.trim() && !userData[field].includes(value.trim())) {
      setUserData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
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
      education: [
        ...prev.education,
        { institution: null, degree: null, field: null, startYear: null, endYear: null }
      ]
    }));
  };

  const addExperience = () => {
    setUserData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: null, position: null, startDate: null, endDate: null, description: null }
      ]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
                <Avatar className="w-32 h-32">
                  <AvatarImage src={userData.profile_picture || ""} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Username"
                value={userData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={userData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              <Input
                type="tel"
                placeholder="Phone"
                value={userData.contact.phone || ""}
                onChange={(e) => handleContactChange(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            {["skills", "job_types", "industries"].map((field) => (
              <Card key={field}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {field.replace("_", " ")}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userData[field as keyof Pick<UserProfile, 'skills' | 'job_types' | 'industries'>].map((item, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {item}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeFromArray(field as 'skills' | 'job_types' | 'industries', index)}
                        >
                          <X className="h-3 w-3" />
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
            {userData.education.map((edu, index) => (
              <Card key={index}>
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
                        value={edu.startYear || ""}
                        onChange={(e) => {
                          const newEducation = [...userData.education];
                          newEducation[index] = { ...edu, startYear: e.target.value };
                          handleInputChange("education", newEducation);
                        }}
                      />
                      <Input
                        placeholder="End Year"
                        value={edu.endYear || ""}
                        onChange={(e) => {
                          const newEducation = [...userData.education];
                          newEducation[index] = { ...edu, endYear: e.target.value };
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
            <Button variant="outline" onClick={addEducation}>Add Education</Button>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            {userData.experience.map((exp, index) => (
              <Card key={index}>
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
                      value={exp.position || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, position: e.target.value };
                        handleInputChange("experience", newExperience);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Start Date"
                      value={exp.startDate || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, startDate: e.target.value };
                        handleInputChange("experience", newExperience);
                      }}
                    />
                    <Input
                      placeholder="End Date"
                      value={exp.endDate || ""}
                      onChange={(e) => {
                        const newExperience = [...userData.experience];
                        newExperience[index] = { ...exp, endDate: e.target.value };
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
            <Button variant="outline" onClick={addExperience}>Add Experience</Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;