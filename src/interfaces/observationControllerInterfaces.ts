export interface menteeConsolidatedObservationAttemptsV2QueryParams {
    menteeId?: string;
    solutionId?: string;
    groupBy?: string;
}
export interface SubmitObservationRequestBody {
    mentee_id?: string;
    mentor_id?: string;
    solution_id?: string;
    submission_id?: string;
    attempted_count?: number;
    mentoring_relationship_id?: string;
    submission_data?: any; // Adjust the type according to your actual data structure
    observation_id?: string;
}
export interface AddEntityToObservationRequestQuery {
    mentee_id?: string;
    observation_id?: string;
}
export interface GetobservationDetailsRequestQuery {
    observation_id?: string;
    mentee_id?: string;
    submission_number?: string;
}
export interface ObservationOtpVerificationRequestBody {
    otp?: string;
    mentee_id?: string;
    mentor_id?: string;
    solution_id?: string;
}