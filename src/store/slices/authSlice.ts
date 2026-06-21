import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit"

import type { AppRole } from "@/lib/auth-role"
import type { UserBusiness } from "@/lib/auth-login"
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
  setActiveBusinessId,
  type AuthSession,
  type SessionUser,
} from "@/lib/auth-session"
import { resetStore } from "@/store/resetActions"

type AuthState = {
  session: AuthSession | null
  ready: boolean
  error: string | null
}

const initialState: AuthState = {
  session: null,
  ready: false,
  error: null,
}

export function buildSessionFromLogin(data: {
  userId: string
  businessId: string
  accessToken: string
  refreshToken?: string
  role: AppRole
  userName: string
  businesses: UserBusiness[]
}): AuthSession {
  const user: SessionUser = {
    id: data.userId,
    name: data.userName,
    role: data.role,
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.userId,
    businessId: data.businessId,
    role: data.role,
    user,
    businesses: data.businesses,
  }
}

export const initializeAuthSession = createAsyncThunk<
  AuthSession | null,
  void
>("auth/initializeSession", async () => readAuthSession())

export const logoutUser = createAsyncThunk<void, void>(
  "auth/logout",
  async (_, { dispatch }) => {
    clearAuthSession()
    dispatch(resetStore())
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      saveAuthSession(action.payload)
      state.session = action.payload
      state.error = null
    },
    setBusinessId(state, action: PayloadAction<string>) {
      if (!state.session) return
      setActiveBusinessId(action.payload)
      state.session = {
        ...state.session,
        businessId: action.payload,
      }
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuthSession.pending, (state) => {
        state.ready = false
        state.error = null
      })
      .addCase(initializeAuthSession.fulfilled, (state, action) => {
        state.session = action.payload
        state.ready = true
      })
      .addCase(initializeAuthSession.rejected, (state) => {
        state.session = null
        state.ready = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.session = null
        state.ready = true
        state.error = null
      })
      .addCase(resetStore, () => initialState)
  },
})

export const authActions = authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthSession = (state: { auth: AuthState }) =>
  state.auth.session
export const selectAuthReady = (state: { auth: AuthState }) => state.auth.ready
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
