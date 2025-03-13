import axiosInstance from '@/services/api/userInstance';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoadingScreen from '../Loading/Loading';

interface QuizComponentProps {
  questions: string[]; 
  jobId: string;
  quizId: string;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions, jobId, quizId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(120); 
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isTimerActive && timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      handleTimeUp();
    }

    return () => clearInterval(timerId);
  }, [timeRemaining, isTimerActive]);

  useEffect(() => {
    setTimeRemaining(120);
    setIsTimerActive(true);
    setCurrentAnswer(answers[currentQuestionIndex] || '');
  }, [currentQuestionIndex]);

  const handleTimeUp = () => {
    setIsTimerActive(false);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = "answer is not provided";
    setAnswers(newAnswers);
    setCurrentAnswer("answer is not provided");
  };

  const handleSubmit = async () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      console.log("Quiz completed! All answers:", newAnswers);
      setIsLoading(true);
      try {
        const response = await axiosInstance.post('/job/applyWithAnswers', {
          answers: newAnswers, 
          jobId, 
          quizId
        });
        
        console.log("Response after applying for job:", response);
        if(response.data.success) {
          toast.success("Applied Successfully");
          navigate('/');
        } else {
          toast.info("Something went wrong. Please Try Again!");
          navigate('/');
        }
      } catch (error) {
        console.error("Error applying for job:", error);
        toast.error("Failed to apply for job. Please try again later.");
        navigate('/');
      } finally {
        setIsLoading(false);
        setIsTimerActive(false);
      }
    }
  };

  const handleSkip = async () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = "answer is not provided";
    setAnswers(newAnswers);
  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      console.log("Quiz completed! All answers:", newAnswers);
      setIsLoading(true);
      try {
        const response = await axiosInstance.post('/job/applyWithAnswers', { 
          answers: newAnswers, 
          jobId, 
          quizId 
        });
        
        console.log("Response after applying for job:", response);
        if(response.data.success) {
          toast.success("Applied Successfully");
          navigate('/');
        } else {
          toast.info("Something went wrong. Please Try Again!");
          navigate('/');
        }
      } catch (error) {
        console.error("Error applying for job:", error);
        toast.error("Failed to apply for job. Please try again later.");
        navigate('/');
      } finally {
        setIsLoading(false);
        setIsTimerActive(false);
      }
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-3xl p-8">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-white text-sm">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className={`px-3 py-1 rounded-md ${
            timeRemaining < 30 ? 'bg-red-500' : 'bg-green-700'
          } text-white text-sm flex items-center`}>
            <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Time remaining: {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-white text-lg font-medium mb-4">
            {currentQuestion}
          </h2>

          <div className="mb-6">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Write answer here..."
              className="w-full p-4 bg-purple-900/50 text-white border border-purple-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none h-24"
              disabled={!isTimerActive && timeRemaining === 0}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={handleSkip}
              className="px-4 py-2 bg-transparent border border-green-500 text-green-500 rounded-md hover:bg-green-900/20 transition-colors cursor-pointer"
            >
              Skip Question
            </button>
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors cursor-pointer"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Apply For Job"}
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div 
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentQuestionIndex 
                    ? 'bg-white' 
                    : idx < currentQuestionIndex 
                      ? 'bg-green-500' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;