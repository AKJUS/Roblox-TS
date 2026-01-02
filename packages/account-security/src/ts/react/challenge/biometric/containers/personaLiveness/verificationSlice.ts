/* eslint-disable no-param-reassign */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

import { VerificationErrorCode, VerificationStatusCode } from './enums';
import {
  getPersonaVerificationStatus,
  startPersonaLivenessVerification
} from './services/verificationAPI';

export interface SessionStatus {
  sessionStatus: VerificationStatusCode;
  sessionErrorCode: VerificationErrorCode;
}

export interface VendorData {
  daysUntilNextVerification: number;
  sessionIdentifier: string | null;
  verificationLink: string | null;
  qrCode: string | null;
  loading: boolean;
}

const vendorDataInitialState: VendorData = {
  daysUntilNextVerification: 0,
  sessionIdentifier: null,
  verificationLink: null,
  qrCode: null,
  loading: false
};

export enum VerificationStatusType {
  Init = 'Init',
  Loading = 'Loading',
  Challenge = 'Challenge',
  Polling = 'Polling',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export type VerificationStatus =
  | {
      status: VerificationStatusType.Init;
    }
  | {
      status: VerificationStatusType.Loading;
    }
  | {
      status: VerificationStatusType.Challenge;
    }
  | {
      status: VerificationStatusType.Polling;
    }
  | {
      status: VerificationStatusType.Completed;
      error: string | null;
    }
  | {
      status: VerificationStatusType.Cancelled;
    };

export interface VerificationState {
  vendorData: VendorData;
  sessionStatus: SessionStatus;
  verificationStatus: VerificationStatus;
}

const initialState: VerificationState = {
  vendorData: vendorDataInitialState,
  verificationStatus: { status: VerificationStatusType.Init },
  sessionStatus: {
    sessionStatus: VerificationStatusCode.Unknown,
    sessionErrorCode: VerificationErrorCode.NoError
  }
};

export const selectVendorData = (state: RootState): VendorData => state.verification.vendorData;
export const selectVerificationStatus = (state: RootState): VerificationStatus =>
  state.verification.verificationStatus;

export const startVerification = createAsyncThunk(
  'verification/startIDVerification',
  async (_, thunkAPI) => {
    try {
      const response = (await startPersonaLivenessVerification()) as VendorData;
      if (response === undefined) {
        return thunkAPI.rejectWithValue('Failed to start liveness verification');
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to start liveness verification');
    }
  }
);

export const fetchVerificationStatus = createAsyncThunk(
  'verification/fetchIDVerificationStatus',
  async (token: string, thunkAPI) => {
    try {
      const response = await getPersonaVerificationStatus(token);
      if (response === undefined) {
        return thunkAPI.rejectWithValue('Failed to fetch liveness verification status');
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to fetch liveness verification status');
    }
  }
);

export const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    resetVerificationStore: () => initialState,
    setVerificationStatus: (state, action: PayloadAction<VerificationStatus>) => {
      state.verificationStatus = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(startVerification.pending, (state, _action) => {
        const { vendorData } = state;
        vendorData.loading = true;

        state.vendorData = vendorData;
      })
      .addCase(startVerification.fulfilled, (state, action) => {
        const vendorData = action.payload;
        vendorData.loading = false;

        state.vendorData = vendorData;
      })
      .addCase(startVerification.rejected, (state, action) => {
        const { vendorData } = state;
        vendorData.loading = false;

        state.vendorData = vendorData;
        state.verificationStatus = {
          status: VerificationStatusType.Completed,
          error: action.error.message || 'Start verification failed'
        };
      })
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        const sessionStatus = action.payload as SessionStatus;
        state.sessionStatus = sessionStatus;

        switch (sessionStatus.sessionStatus) {
          case VerificationStatusCode.RequiresRetry:
          case VerificationStatusCode.RequiresManualReview:
          case VerificationStatusCode.Failure:
          case VerificationStatusCode.Expired:
            state.verificationStatus = {
              status: VerificationStatusType.Completed,
              error: sessionStatus.sessionErrorCode.toString()
            };
            break;
          case VerificationStatusCode.Stored:
            state.verificationStatus = { status: VerificationStatusType.Completed, error: null };
            break;
          case VerificationStatusCode.Started:
          case VerificationStatusCode.Submitted:
          case VerificationStatusCode.Success: // Wait until is actually stored in IAS before redeem, otherwise redemption may fail.
          default:
            break;
        }
      })
      .addCase(fetchVerificationStatus.rejected, (state, _action) => {
        state.verificationStatus = {
          status: VerificationStatusType.Completed,
          error: 'Failed to fetch verification status'
        };
      });
  }
});

export const { resetVerificationStore, setVerificationStatus } = verificationSlice.actions;

export default verificationSlice.reducer;
