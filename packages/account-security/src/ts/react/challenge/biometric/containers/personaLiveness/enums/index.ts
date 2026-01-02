export enum VerificationStatusCode {
  Unknown,
  Success,
  Failure,
  RequiresManualReview,
  RequiresRetry,
  Started,
  Submitted,
  Stored,
  Expired
}

export enum VerificationErrorCode {
  NoError,
  UnknownError,
  InvalidDocument,
  InvalidSelfie,
  BelowMinimumAge,
  LowQualityMedia,
  DocumentUnsupported
}
