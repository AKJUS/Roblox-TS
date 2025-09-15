/* eslint-disable no-param-reassign */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import reportEvent from './services/reportEventService';
import { RootState } from './store';
import { getPageStateConstants } from './constants/textConstants';

import {
  IDVPage,
  Recourse,
  ReportEvent,
  VerificationErrorCode,
  VerificationStatusCode,
  VerificationViewState
} from './enums';
import {
  getPersonaVerificationStatus,
  startPersonaIdVerification
} from './services/IDverificationAPI';

export interface VerificationStatus {
  sessionStatus: VerificationStatusCode;
  sessionErrorCode: VerificationErrorCode;
}

export interface VendorVerificationData {
  daysUntilNextVerification: number;
  sessionIdentifier: string;
  verificationLink: string;
  qrCode: string;
  loading: boolean;
}

const VendorVerificationDataInitialState: VendorVerificationData = {
  daysUntilNextVerification: 0,
  sessionIdentifier: '',
  verificationLink: '',
  qrCode: '',
  loading: false
};

export interface PageText {
  heading: string;
  bodyText: string[];
  icon: string;
  footerText: string;
  buttonText: string;
}

export interface IDVerificationState {
  page: IDVPage;
  vendorVerificationData: VendorVerificationData;
  loading: boolean;
  status: VerificationStatus;
  completionPageState: PageText;
  error: string | null;
}

const IDVinitialState: IDVerificationState = {
  page: IDVPage.VendorLink,
  vendorVerificationData: VendorVerificationDataInitialState,
  loading: false,
  status: {
    sessionStatus: VerificationStatusCode.Unknown,
    sessionErrorCode: VerificationErrorCode.NoError
  },
  completionPageState: {
    heading: '',
    bodyText: [],
    icon: '',
    footerText: '',
    buttonText: ''
  },
  error: ''
};

export interface VerificationState {
  verified: boolean;
  IDVerificationState: IDVerificationState;
  loading: boolean;
}

const initialState: VerificationState = {
  verified: false,
  IDVerificationState: IDVinitialState,
  loading: false
};

export const selectIDVState = (state: RootState) => state.verification.IDVerificationState;
export const selectLoading = (state: RootState) => state.verification.loading;

export const startIDVerification = createAsyncThunk(
  'verification/startIDVerification',
  async (_, thunkAPI) => {
    try {
      const response = (await startPersonaIdVerification()) as VendorVerificationData;
      if (response === undefined) {
        reportEvent(ReportEvent.VerificationFailed, Recourse.AgeEstimation, {
          error: 'API returned undefined response'
        });
        return thunkAPI.rejectWithValue('Failed to start ID Verification');
      }
      return response;
    } catch (error) {
      reportEvent(ReportEvent.VerificationFailed, Recourse.AgeEstimation, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to start ID Verification');
    }
  }
);

export const fetchIDVerificationStatus = createAsyncThunk(
  'verification/fetchIDVerificationStatus',
  async (token: string, thunkAPI) => {
    try {
      const response = await getPersonaVerificationStatus(token);
      if (response === undefined) {
        reportEvent(ReportEvent.VerificationFailed, Recourse.AgeEstimation, {
          error: 'API returned undefined response'
        });
        return thunkAPI.rejectWithValue('Failed to fetch ID Verification status');
      }
      return response;
    } catch (error) {
      reportEvent(ReportEvent.VerificationFailed, Recourse.AgeEstimation, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to fetch ID Verification status');
    }
  }
);

export const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    resetVerificationStore: () => initialState,
    setVerified: (state, action: PayloadAction<boolean>) => {
      state.verified = action.payload;
    },
    setIDVerificationState: (state, action: PayloadAction<IDVerificationState>) => {
      state.IDVerificationState = { ...action.payload };
    },
    setIDVPage: (state, action: PayloadAction<IDVPage>) => {
      state.IDVerificationState.page = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(startIDVerification.pending, (state, action) => {
        const { vendorVerificationData } = state.IDVerificationState;
        vendorVerificationData.loading = true;
        state.IDVerificationState = {
          ...state.IDVerificationState,
          vendorVerificationData,
          loading: true
        };
      })
      .addCase(startIDVerification.fulfilled, (state, action) => {
        const vendorVerificationData = action.payload;
        const { daysUntilNextVerification } = vendorVerificationData;
        let completionPageState = null;
        vendorVerificationData.loading = false;
        if (daysUntilNextVerification != null && daysUntilNextVerification > 0) {
          completionPageState = getPageStateConstants(VerificationViewState.TEMP_BAN, [
            'Label.FailedVerificationInvalidDocument'
          ]);
        }
        state.IDVerificationState = {
          ...state.IDVerificationState,
          vendorVerificationData,
          ...(completionPageState && { completionPageState }),
          loading: false
        };
      })
      .addCase(startIDVerification.rejected, (state, action) => {
        const { vendorVerificationData } = state.IDVerificationState;
        vendorVerificationData.loading = false;

        state.IDVerificationState = {
          ...state.IDVerificationState,
          vendorVerificationData,
          loading: false,
          error: action.error.message || 'Something went wrong'
        };
      })
      .addCase(fetchIDVerificationStatus.pending, state => {
        state.IDVerificationState = {
          ...state.IDVerificationState,
          loading: true
        };
      })
      .addCase(fetchIDVerificationStatus.fulfilled, (state, action) => {
        const vendorData = action.payload as VerificationStatus;
        let completionPageState;
        let { page } = state.IDVerificationState;
        switch (vendorData.sessionStatus) {
          case VerificationStatusCode.RequiresRetry:
          case VerificationStatusCode.Failure:
            page = IDVPage.Complete;
            switch (vendorData.sessionErrorCode) {
              case VerificationErrorCode.InvalidDocument:
              case VerificationErrorCode.BelowMinimumAge:
                completionPageState = getPageStateConstants(VerificationViewState.FAILURE, [
                  'Label.FailedVerificationInvalidDocument'
                ]);
                break;
              case VerificationErrorCode.LowQualityMedia:
              case VerificationErrorCode.InvalidSelfie:
                completionPageState = getPageStateConstants(VerificationViewState.FAILURE, [
                  'Label.FailedVerificationLowQuality'
                ]);
                break;
              case VerificationErrorCode.DocumentUnsupported:
                completionPageState = getPageStateConstants(VerificationViewState.FAILURE, [
                  'Label.FailedVerificationUnsupportedDocument'
                ]);
                break;
              default:
                completionPageState = getPageStateConstants(VerificationViewState.FAILURE);
                break;
            }
            break;
          case VerificationStatusCode.RequiresManualReview:
            page = IDVPage.Complete;
            completionPageState = getPageStateConstants(VerificationViewState.PENDING);
            break;
          case VerificationStatusCode.Success:
          case VerificationStatusCode.Stored:
            page = IDVPage.Complete;
            completionPageState = getPageStateConstants(VerificationViewState.SUCCESS_GENERIC);
            break;
          case VerificationStatusCode.Started:
            page = IDVPage.Checklist;
            reportEvent(ReportEvent.VerificationStarted, Recourse.AgeEstimation, {
              session: state.IDVerificationState.vendorVerificationData.sessionIdentifier
            });
            break;
          case VerificationStatusCode.Submitted:
            reportEvent(ReportEvent.verificationInProgress, Recourse.AgeEstimation, {
              session: state.IDVerificationState.vendorVerificationData.sessionIdentifier
            });
            break;
          default:
        }
        state.IDVerificationState = {
          ...state.IDVerificationState,
          loading: false,
          status: vendorData,
          ...(completionPageState && { completionPageState }),
          page
        };
      })
      .addCase(fetchIDVerificationStatus.rejected, (state, action) => {
        state.IDVerificationState = {
          ...state.IDVerificationState,
          loading: false,
          error: action.error.message || 'Something went wrong'
        };
      });
  }
});

export const {
  resetVerificationStore,
  setVerified,
  setIDVerificationState,
  setIDVPage,
  setLoading
} = verificationSlice.actions;

export default verificationSlice.reducer;
