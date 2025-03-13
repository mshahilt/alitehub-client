import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Send, Trash2, Wand2, Loader2 } from 'lucide-react';
import AddQuizForJob from './AddQuizForJob';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "sonner";
import { AppDispatch, RootState } from '@/app/redux/store';
import { removeQuestion, setQuestions, GenerateAiQuestion } from '@/app/redux/slices/company/quizSlice';
import axiosInstance from '@/services/api/userInstance';
import { getCompany } from '@/app/redux/slices/company/companyAuthSlice';


type FormData = {
  jobTitle: string;
  company: string;
  companyId: string;
  workplaceType: string;
  jobType: string;
  jobLocation: string;
  description: string;
  yearsExperienceExpecting: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
};

type AddJobFormProps = {
  usage: "edit" | "add";
  jobId?: string;
};

const AddJobForm: React.FC<AddJobFormProps> = ({ usage, jobId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newQualification, setNewQualification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const questions = useSelector((state: RootState) => state.companyQuiz.questions);
  
  const [formData, setFormData] = useState<FormData>({
    jobTitle: '',
    company: '',
    companyId: '',
    workplaceType: '',
    jobType: '',
    jobLocation: '',
    description: '',
    yearsExperienceExpecting: '',
    responsibilities: [],
    qualifications: [],
    skills: []
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await dispatch(getCompany());
        if (response.meta.requestStatus === "fulfilled") {
          const payload = response.payload as { name: string, id: string }; 
          setFormData(prevFormData => ({
            ...prevFormData,
            companyId: payload.id,
            company: payload.name
          }));
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        toast.error("Failed to fetch company data");
      }
    };
    
    fetchCompany();
  }, [dispatch]);

  useEffect(() => {
    const fetchJobData = async () => {
      if (usage === "edit" && jobId) {
        try {
          setIsLoading(true);
          const response = await axiosInstance.get(`/job/${jobId}`);
          
          setFormData(response.data.job);

          const quizQuestions = await axiosInstance.get(`/job/quiz/${jobId}`);
          console.log(quizQuestions.data.quiz.questions);
          console.log(quizQuestions.data.quiz.questions.length);
          if (quizQuestions.data.quiz.questions.length > 0) {
            console.log("response.data.quiz.questions", quizQuestions.data.quiz.questions);
            dispatch(setQuestions(quizQuestions.data.quiz.questions));
          }
          
        } catch (error) {
          console.error("Error fetching job  data:", error);
          toast.error("Failed to fetch job data");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchJobData();
  }, [usage, jobId, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, name: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSkill(e.target.value);
  };

  const handleQualificationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewQualification(e.target.value);
  };

  const handleResponsibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewResponsibility(e.target.value);
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() === "") return; 
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    setNewSkill(""); 
  };

  const handleAddQualification = () => {
    if (newQualification.trim() === "") return; 
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newQualification],
    }));
    setNewQualification(""); 
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim() === "") return; 
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, newResponsibility],
    }));
    setNewResponsibility(""); 
  };

  const handleGenerateAiQuestion = async () => {
    try {
      setIsGeneratingQuestions(true);
      const jobDataForQuestionGeneration = {
        description: formData.description,
        responsibilities: formData.responsibilities,
        experienceExpecting: formData.yearsExperienceExpecting
      };

      const result = await dispatch(GenerateAiQuestion(jobDataForQuestionGeneration)).unwrap();
      console.log("Generated Questions:", result);
    } catch (error) {
      console.error("Error generating AI questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(questions.length === 0) {
      toast.info('Please add screening questions');
      return;
    }
    
    try {
      setIsLoading(true);
      let response;
      
      if (usage === "add") {
        response = await axiosInstance.post('/job/add', {
          jobDetails: formData,
          screeningQuiz: questions
        });
        toast.success("Job added successfully");
      } else {
        console.log("Update called")
        // Edit existing job
        response = await axiosInstance.put(`/job/update/${jobId}`, {
          jobDetails: formData,
        });
        toast.success("Job updated successfully");
      }
      
      console.log(response);
      console.log("job questions", questions);
      console.log('Form submitted:', formData);
      
      // Optionally, redirect to job listings or job details page after successful submission
      // For example: navigate('/jobs');
    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error(usage === "add" ? "Failed to add job" : "Failed to update job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveQuestion = (id: string) => {
    dispatch(removeQuestion(id));
  };

  const handleRemoveSkill = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== itemToRemove),
    }));
  };

  const handleRemoveQualification = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(qualification => qualification !== itemToRemove),
    }));
  };

  const handleRemoveResponsibility = (itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter(responsibility => responsibility !== itemToRemove),
    }));
  };

  if (usage === "edit" && isLoading && !formData.jobTitle) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          {usage === "add" ? "Create New Position" : "Edit Position"}
        </h1>

        <Card className="bg-secondary border-0 shadow-2xl backdrop-blur-sm">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-xl text-white">Job Details</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Job Title</label>
                  <Input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                    className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50 hover:bg-primary/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Company</label>
                  <Input
                    name="company"
                    disabled={true}
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50 hover:bg-primary/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Job Location</label>
                  <Input
                    name="jobLocation"
                    value={formData.jobLocation}
                    onChange={handleInputChange}
                    placeholder="Enter job location"
                    className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50 hover:bg-primary/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Experience Expecting</label>
                  <Input
                    name="yearsExperienceExpecting"
                    value={formData.yearsExperienceExpecting}
                    onChange={handleInputChange}
                    placeholder="Enter number of years expecting"
                    className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50 hover:bg-primary/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Job Responsibilities</label>
                  <div className="flex items-center bg-primary/40 border border-primary/20 rounded-md px-3">
                    <Input
                      name="jobResponsibilities"
                      value={newResponsibility}
                      onChange={handleResponsibilityInputChange}
                      placeholder="Enter job responsibilities"
                      className="bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 flex-1"
                    />
                    <PlusCircle onClick={handleAddResponsibility} className="w-5 h-5 text-white cursor-pointer" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.responsibilities?.length > 0 &&
                      formData.responsibilities.map((responsibility, index) => (
                        <div 
                          key={`${responsibility}-${index}`}
                          className="flex items-center gap-2 bg-primary/40 text-white px-3 py-1 rounded-lg"
                        >
                          <p className="text-white/70">{responsibility}</p>
                          <button type="button" onClick={() => handleRemoveResponsibility(responsibility)}>
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Job Qualifications</label>
                  <div className="flex items-center bg-primary/40 border border-primary/20 rounded-md px-3">
                    <Input
                      name="jobQualifications"
                      value={newQualification}
                      onChange={handleQualificationInputChange}
                      placeholder="Enter job qualifications"
                      className="bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 flex-1"
                    />
                    <PlusCircle onClick={handleAddQualification} className="w-5 h-5 text-white cursor-pointer" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.qualifications?.length > 0 &&
                      formData.qualifications.map((qualification, index) => (
                        <div 
                          key={`${qualification}-${index}`}
                          className="flex items-center gap-2 bg-primary/40 text-white px-3 py-1 rounded-lg"
                        >
                          <p className="text-white/70">{qualification}</p>
                          <button type="button" onClick={() => handleRemoveQualification(qualification)}>
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Workplace Type</label>
                  <Select
                    value={formData.workplaceType}
                    onValueChange={(value) => handleSelectChange(value, 'workplaceType')}
                  >
                    <SelectTrigger className="bg-primary/40 border-primary/20 text-white hover:bg-primary/50 transition-colors">
                      <SelectValue placeholder="Select workplace type" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary text-white border-primary/20">
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Job Type</label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) => handleSelectChange(value, 'jobType')}
                  >
                    <SelectTrigger className="bg-primary/40 border-primary/20 text-white hover:bg-primary/50 transition-colors">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary text-white border-primary/20">
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Description</label>
                <div className="rounded-lg overflow-hidden bg-primary/40 border border-primary/20">
                  <div className="flex gap-2 p-2 border-b border-primary/20 bg-primary/60"></div>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter job description"
                    className="min-h-[200px] bg-transparent border-0 text-white placeholder:text-white/50 resize-none focus-visible:ring-0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {formData.skills?.length > 0 &&
                    formData.skills.map((skill, index) => (
                      <div 
                        key={`${skill}-${index}`}
                        className="flex items-center gap-2 bg-primary/40 text-white px-3 py-1 rounded-lg"
                      >
                        <p className="text-white/70">{skill}</p>
                        <button type="button" onClick={() => handleRemoveSkill(skill)}>
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors" />
                        </button>
                      </div>
                    ))
                  }
                </div>
                <div className="flex gap-2">
                  <Input
                    onChange={handleSkillInputChange}
                    value={newSkill}
                    placeholder="Add required skills"
                    className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50 hover:bg-primary/50 transition-colors"
                  />
                  <Button onClick={handleAddSkill} type="button" variant="ghost" className="text-white hover:bg-primary/40">
                    <PlusCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </form>
            
            <div className="mt-6">
              <h3 className="text-white/80 text-lg font-semibold mb-3">Screening Questions</h3>
              {questions.length === 0 ? (
                <p className="text-white/70">No questions added yet.</p>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-black/40 p-4 mt-3 rounded-lg flex justify-between items-start"
                  >
                    <div className="space-y-2">
                      <p className="text-white">{question.question}</p>
                      {question.type === "multiple" && (
                        <ul className="list-disc list-inside text-white/70">
                          {question.options?.map((option, index) => (
                            <li key={index}>{option}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-white hover:bg-primary/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
            
          <CardFooter className="flex justify-between p-6 border-t border-primary/10">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-gray-200 hover:text-black cursor-pointer"
                onClick={() => setIsQuizModalOpen(true)}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Add Screening Questions
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-gray-200 hover:text-black cursor-pointer"
                onClick={handleGenerateAiQuestion}
                disabled={isGeneratingQuestions}
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Questions
                  </>
                )}
              </Button>
            </div>
            <Button 
              type="submit" 
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {usage === "add" ? "Posting..." : "Updating..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {usage === "add" ? "Post Job" : "Update Job"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <AddQuizForJob isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} jobFormData={formData} />
    </div>
    </>
  );
};

export default AddJobForm;