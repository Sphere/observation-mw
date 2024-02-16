// apiResponse.ts

export interface ApiResponse<T = any> {
    timestamp: number;
    status: 'success' | 'error';
    message?: string;
    data?: T;
}

