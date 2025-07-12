import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import questionsReducer from './slices/questionsSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionsReducer,
    notifications: notificationReducer,
  },
})