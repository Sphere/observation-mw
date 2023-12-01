import chai from 'chai';
import chaiHttp from 'chai-http';
import spies from 'chai-spies';
import { expect } from 'chai'
import { sendOtp, verifyOtp, resendOtp } from '../src/controllers/otpController';
import mockAxios from 'jest-mock-axios';

chai.use(chaiHttp);
chai.use(spies); // Add chai-spiesconst expect = chai.expect;

// Mocking request object for testing
const mockRequest = (query: Record<string, any>): any => ({ query });

// Mocking response object for testing
const mockResponse = (): any => {
    const res: any = {};
    res.status = (statusCode: number) => {
        res.statusCode = statusCode;
        return res;
    };
    res.json = (data: any) => {
        res.body = data;
        return res;
    };
    return res;
};

// Cast the mock functions to the specific types
const mockAxiosPost = mockAxios.post as jest.Mock;
const mockAxiosGet = mockAxios.get as jest.Mock;

describe('OTP Controller Tests', () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    describe('sendOtp', () => {
        it('should send OTP successfully', async () => {
            const req = mockRequest({ phone: '1234567890' });
            const res = mockResponse();

            // Mock the Axios response for the specific endpoint
            mockAxiosPost.mockResolvedValueOnce({ data: { success: true, message: 'OTP sent successfully' } });

            await sendOtp(req, res);

            expect(res.statusCode).to.equal(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.message).to.equal('OTP sent successfully');

            // Use chai-http to assert the HTTP call
            expect(chai.spy(mockAxios.post)).to.have.been.called.with('https://control.msg91.com/api/v5/otp');
        });

        it('should handle missing parameters', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await sendOtp(req, res);

            expect(res.statusCode).to.equal(400);
            expect(res.body.type).to.equal('Failed');
            expect(res.body.error).to.equal('Missing parameters: phone');
        });

        it('should handle internal server error', async () => {
            // Simulate an internal server error
            mockAxiosPost.mockRejectedValueOnce('Internal Server Error');

            const req = mockRequest({ phone: '1234567890' });
            const res = mockResponse();

            await sendOtp(req, res);

            expect(res.statusCode).to.equal(500);
            expect(res.body.type).to.equal('Failed');
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    describe('verifyOtp', () => {
        it('should verify OTP successfully', async () => {
            const req = mockRequest({ phone: '1234567890', otp: '1234' });
            const res = mockResponse();

            mockAxiosGet.mockResolvedValueOnce({ data: { success: true, message: 'OTP verified successfully' } });

            await verifyOtp(req, res);

            expect(res.statusCode).to.equal(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.message).to.equal('OTP verified successfully');

            // Use chai-http to assert the HTTP call
            expect(chai.spy(mockAxios.get)).to.have.been.called.with('https://control.msg91.com/api/v5/otp/verify');
        });

        it('should handle missing parameters', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await verifyOtp(req, res);

            expect(res.statusCode).to.equal(400);
            expect(res.body.type).to.equal('Failed');
            expect(res.body.error).to.equal('Missing parameters: otp, phone');
        });

        it('should handle internal server error', async () => {
            // Simulate an internal server error
            mockAxiosGet.mockRejectedValueOnce('Internal Server Error');

            const req = mockRequest({ phone: '1234567890', otp: '1234' });
            const res = mockResponse();

            await verifyOtp(req, res);

            expect(res.statusCode).to.equal(500);
            expect(res.body.type).to.equal('Failed');
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    describe('resendOtp', () => {
        it('should resend OTP successfully', async () => {
            const req = mockRequest({ phone: '1234567890' });
            const res = mockResponse();

            mockAxiosGet.mockResolvedValueOnce({ data: { success: true, message: 'OTP resent successfully' } });

            await resendOtp(req, res);

            expect(res.statusCode).to.equal(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.message).to.equal('OTP resent successfully');

            // Use chai-http to assert the HTTP call
            expect(chai.spy(mockAxios.get)).to.have.been.called.with('https://control.msg91.com/api/v5/otp/retry');
        });

        it('should handle missing parameters', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await resendOtp(req, res);

            expect(res.statusCode).to.equal(400);
            expect(res.body.type).to.equal('Failed');
            expect(res.body.error).to.equal('Missing parameters: phone');
        });

        it('should handle internal server error', async () => {
            // Simulate an internal server error
            mockAxiosGet.mockRejectedValueOnce('Internal Server Error');

            const req = mockRequest({ phone: '1234567890' });
            const res = mockResponse();

            await resendOtp(req, res);

            expect(res.statusCode).to.equal(500);
            expect(res.body.type).to.equal('Failed');
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });
});
