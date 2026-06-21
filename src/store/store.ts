import {
  AnyAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit"

import { authReducer } from "@/store/slices/authSlice"
import { resetStore } from "@/store/resetActions"

const appReducer = combineReducers({
  auth: authReducer,
})

const RESET_TYPE = resetStore.type
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction
) => {
  if (action.type === RESET_TYPE) {
    state = undefined
  }
  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [resetStore.type],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
