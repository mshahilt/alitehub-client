import { useState } from "react";
import { X, PlusCircle, Trash2, Wand2, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { addQuestion, removeQuestion } from "@/app/redux/slices/company/quizSlice";
import { GenerateAiQuestion } from "@/app/redux/slices/company/quizSlice";

type JobFormData = {
  jobTitle: string;
  company: string;
  workplaceType: string;
  jobType: string;
  jobLocation: string;
  description: string;
  yearsExperienceExpecting: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
};

interface AddQuizForJobProps {
  isOpen: boolean;
  onClose: () => void;
  jobFormData: JobFormData;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple" | "text" | "boolean";
  options?: string[];
  correctAnswer?: string;
}

const AddQuizForJob = ({ isOpen, onClose , jobFormData}: AddQuizForJobProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const questions = useSelector((state: RootState) => state.companyQuiz.questions);
  const loading = useSelector((state: RootState) => state.companyQuiz.loading);

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: "",
    question: "",
    type: "multiple",
    options: [""],
    correctAnswer: "",
  });

  const handleAddOption = () => {
    if (currentQuestion.options) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, ""],
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options) {
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddQuestion = () => {
    dispatch(addQuestion({
      ...currentQuestion,
      id: Date.now().toString(),
    }))
    setCurrentQuestion({
      id: "",
      question: "",
      type: "multiple",
      options: [""],
      correctAnswer: "",
    });
  };

  const handleRemoveQuestion = (id: string) => {
    dispatch(removeQuestion(id));
  };

  const handleGenerateAiQuestion = async () => {
    try {
        const jobDataForQuestionGeneration = {
            description: jobFormData.description,
            responsibilities: jobFormData.responsibilities,
            experienceExpecting: jobFormData.yearsExperienceExpecting
        };

        const result = await dispatch(GenerateAiQuestion(jobDataForQuestionGeneration)).unwrap();
        console.log("Generated Questions:", result); 
    } catch (error) {
        console.error("Error generating AI questions:", error);
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-secondary border-0 shadow-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-primary/10 flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-white">Add Screening Questions</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-primary/40">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
  
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4 bg-primary/40 p-4 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Question</label>
              <Input
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                placeholder="Enter your question"
                className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50"
              />
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Question Type</label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value: "multiple" | "text" | "boolean") =>
                  setCurrentQuestion({ ...currentQuestion, type: value })
                }
              >
                <SelectTrigger className="bg-primary/40 border-primary/20 text-white">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-primary/20">
                  <SelectItem value="multiple">Multiple Choice</SelectItem>
                  <SelectItem value="text">Text Answer</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                </SelectContent>
              </Select> 
            </div>
  
            {currentQuestion.type === "multiple" && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Options</label>
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="bg-primary/40 border-primary/20 text-white placeholder:text-white/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="text-white hover:bg-primary/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddOption}
                  className="text-white hover:bg-primary/40"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              className="text-white bg-gray-600 hover:bg-gray-200 hover:text-black cursor-pointer"
              onClick={() => {handleGenerateAiQuestion()}}
            >
              {loading ? (
                <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Question Using Ai
                </>
              ): (
                <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Question Using Ai
                </>
              )}
            </Button>
            <Button
              onClick={handleAddQuestion}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4"
            >
              Add Question
            </Button>
          </div>
  
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Added Questions</h3>
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-primary/40 p-4 rounded-lg flex justify-between items-start"
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
            ))}
          </div>
        </div>
  
        <CardFooter className="flex justify-end p-6 border-t border-primary/10">
          <Button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save Questions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
  
};

export default AddQuizForJob;