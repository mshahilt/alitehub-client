import axiosInstance from "@/services/api/userInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple" | "text" | "boolean";
  options?: string[];
  correctAnswer?: string;
}

interface QuizState {
  questions: QuizQuestion[];
  loading: boolean;
  error: any;
}

const initialState: QuizState = {
  questions: [],
  loading:false,
  error: ''
};


export const GenerateAiQuestion = createAsyncThunk<
    any,
    { description: string; responsibilities: string[]; experienceExpecting: string },
    { rejectValue: string }
>(
    "JobQuiz/generateQuestion",
    async (jobData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/job/generateQuizQuestions', jobData);
            return response.data;  
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to generate Questions");
        }
    }
);


const quizSlice = createSlice({
  name: "JobQuiz",
  initialState,
  reducers: {
    addQuestion: (state, action: PayloadAction<QuizQuestion>) => {
      state.questions.push(action.payload);
    },
    removeQuestion: (state, action: PayloadAction<string>) => {
      state.questions = state.questions.filter((q) => q.id !== action.payload);
    },
    updateQuestion: (state, action: PayloadAction<QuizQuestion>) => {
      const index = state.questions.findIndex((q) => q.id === action.payload.id);
      if (index !== -1) {
        state.questions[index] = action.payload;
      }
    },
    resetQuestions: (state) => {
      state.questions = [];
    },
    setQuestions: (state, action: PayloadAction<QuizQuestion[]>) => {
  state.questions = action.payload;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(GenerateAiQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GenerateAiQuestion.fulfilled, (state, action) => {
        state.loading = false;
        console.log("sdafd",action.payload.questions);
        state.questions = action.payload.questions.map((question:QuizQuestion) => {
            return {id: `${Date.now().toString()}${Math.floor(1000 + Math.random() * 9000)}`, question, type:"text"}
        });
      })
      .addCase(GenerateAiQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to generate questions";
      });
  }
  
});

export const { addQuestion, removeQuestion, updateQuestion, resetQuestions, setQuestions } = quizSlice.actions;
export default quizSlice.reducer;
