import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionsAPI, answersAPI, votesAPI } from '../../services/api';

// Async thunks
export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await questionsAPI.getQuestions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const fetchQuestion = createAsyncThunk(
  'questions/fetchQuestion',
  async (id, { rejectWithValue }) => {
    try {
      const response = await questionsAPI.getQuestion(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch question');
    }
  }
);

export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await questionsAPI.createQuestion(questionData);
      return response.data.question;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create question');
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await questionsAPI.updateQuestion(id, data);
      return response.data.question;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update question');
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await questionsAPI.deleteQuestion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete question');
    }
  }
);

export const fetchAnswers = createAsyncThunk(
  'questions/fetchAnswers',
  async ({ questionId, params }, { rejectWithValue }) => {
    try {
      const response = await answersAPI.getAnswers(questionId, params);
      return { questionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch answers');
    }
  }
);

export const createAnswer = createAsyncThunk(
  'questions/createAnswer',
  async ({ questionId, content }, { rejectWithValue }) => {
    try {
      const response = await answersAPI.createAnswer(questionId, { content });
      return { questionId, answer: response.data.answer };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create answer');
    }
  }
);

export const voteOnContent = createAsyncThunk(
  'questions/voteOnContent',
  async ({ targetType, targetId, voteType }, { rejectWithValue }) => {
    try {
      const response = await votesAPI.vote({ targetType, targetId, voteType });
      return { targetType, targetId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote');
    }
  }
);

// Initial state
const initialState = {
  questions: [],
  currentQuestion: null,
  answers: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    hasNext: false,
    hasPrev: false,
  },
  answersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalAnswers: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  questionLoading: false,
  answersLoading: false,
  error: null,
  filters: {
    search: '',
    tag: '',
    sortBy: 'createdAt',
    order: 'desc',
  },
};

// Questions slice
const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
      state.answers = [];
    },
    updateQuestionVote: (state, action) => {
      const { questionId, voteCount, userVote } = action.payload;
      
      // Update in questions list
      const questionIndex = state.questions.findIndex(q => q._id === questionId);
      if (questionIndex !== -1) {
        state.questions[questionIndex].votes = voteCount;
      }
      
      // Update current question
      if (state.currentQuestion && state.currentQuestion._id === questionId) {
        state.currentQuestion.votes = voteCount;
      }
    },
    updateAnswerVote: (state, action) => {
      const { answerId, voteCount, userVote } = action.payload;
      
      // Update in answers list
      const answerIndex = state.answers.findIndex(a => a._id === answerId);
      if (answerIndex !== -1) {
        state.answers[answerIndex].votes = voteCount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Question
      .addCase(fetchQuestion.pending, (state) => {
        state.questionLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestion.fulfilled, (state, action) => {
        state.questionLoading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestion.rejected, (state, action) => {
        state.questionLoading = false;
        state.error = action.payload;
      })
      // Create Question
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.unshift(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Question
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
        if (state.currentQuestion && state.currentQuestion._id === action.payload._id) {
          state.currentQuestion = action.payload;
        }
      })
      // Delete Question
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload);
        if (state.currentQuestion && state.currentQuestion._id === action.payload) {
          state.currentQuestion = null;
        }
      })
      // Fetch Answers
      .addCase(fetchAnswers.pending, (state) => {
        state.answersLoading = true;
        state.error = null;
      })
      .addCase(fetchAnswers.fulfilled, (state, action) => {
        state.answersLoading = false;
        state.answers = action.payload.answers;
        state.answersPagination = action.payload.pagination;
      })
      .addCase(fetchAnswers.rejected, (state, action) => {
        state.answersLoading = false;
        state.error = action.payload;
      })
      // Create Answer
      .addCase(createAnswer.fulfilled, (state, action) => {
        state.answers.unshift(action.payload.answer);
        if (state.currentQuestion) {
          state.currentQuestion.answers.push(action.payload.answer._id);
        }
      })
      // Vote on Content
      .addCase(voteOnContent.fulfilled, (state, action) => {
        const { targetType, targetId, voteCount } = action.payload;
        
        if (targetType === 'question') {
          const questionIndex = state.questions.findIndex(q => q._id === targetId);
          if (questionIndex !== -1) {
            state.questions[questionIndex].votes = voteCount;
          }
          if (state.currentQuestion && state.currentQuestion._id === targetId) {
            state.currentQuestion.votes = voteCount;
          }
        } else if (targetType === 'answer') {
          const answerIndex = state.answers.findIndex(a => a._id === targetId);
          if (answerIndex !== -1) {
            state.answers[answerIndex].votes = voteCount;
          }
        }
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearCurrentQuestion, 
  updateQuestionVote, 
  updateAnswerVote 
} = questionsSlice.actions;

export default questionsSlice.reducer;
