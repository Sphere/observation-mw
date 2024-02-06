import { expect } from 'chai';
import sinon from 'sinon';
// import { getObservationForMentee, getAllMenteeForMentor, getMentorMenteeDetailsFiltered, mentorObservationFilteredCount } from '../src/mentoringController';
import { getObservationForMentee, getAllMenteeForMentor } from '../src/controllers/mentorController';
import { MentoringRelationship } from '../src/models/mentoringRelationshipModel';
import { MentoringObservation } from '../src/models/mentoringObservationModel';
import { ObservationData } from '../src/models/observationMetaModel';

describe('Mentoring Controller', () => {
    describe('getObservationForMentee', () => {
        it('should return observation data for a given mentee', async () => {
            // Mock the request and response objects
            const req = { query: { menteeId: 'someMenteeId' } };
            const res = {
                status: sinon.stub().returnsThis(),
                json: sinon.stub(),
            };

            // Mock the MentoringRelationship.findAll function
            const findAllStub = sinon.stub(MentoringRelationship, 'findAll').resolves([]);

            // Call the function
            await getObservationForMentee(req as any, res as any);

            // Assert the response
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'SUCCESS', data: [] })).to.be.true;

            // Restore the stubs
            findAllStub.restore();
        });
        // Add more test cases for different scenarios
    });

    describe('getAllMenteeForMentor function', () => {
        afterEach(() => {
            sinon.restore();
        });

        // it('should return observation data for all mentees of a mentor', async () => {
        //     const req = { query: { mentorId: 'exampleMentorId' } };
        //     const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

        //     sinon.stub(MentoringRelationship, 'hasMany');
        //     sinon.stub(MentoringObservation, 'hasMany');
        //     // sinon.stub(MentoringRelationship, 'findAll').resolves([{ /* your sample data here */ }]);

        //     await getAllMenteeForMentor(req, res);

        //     sinon.assert.calledWith(res.status, 200);
        //     sinon.assert.calledWith(res.json, sinon.match({ message: 'SUCCESS', data: sinon.match.array }));
        // });

        it('should handle the case where no mentees are found for the given mentor', async () => {
            const req = { query: { mentorId: 'nonExistentMentorId' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(MentoringRelationship, 'hasMany');
            sinon.stub(MentoringObservation, 'hasMany');
            sinon.stub(MentoringRelationship, 'findAll').resolves([]);

            await getAllMenteeForMentor(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, sinon.match({ message: 'SUCCESS', data: sinon.match.array }));
            expect(res.json.args[0][0].data).to.have.lengthOf(0);
        });

        it('should handle errors and return a 500 status code', async () => {
            const req = { query: { mentorId: 'exampleMentorId' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

            sinon.stub(MentoringRelationship, 'hasMany');
            sinon.stub(MentoringObservation, 'hasMany');
            sinon.stub(MentoringRelationship, 'findAll').rejects(new Error('Test error'));

            await getAllMenteeForMentor(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, sinon.match({ message: 'Something went wrong while fetching MENTOR data' }));
        });
    });

    describe('getMentorMenteeDetailsFiltered', () => {
        // Similar structure as getObservationForMentee, create test cases
    });

    describe('mentorObservationFilteredCount', () => {
        // Similar structure as getObservationForMentee, create test cases
    });
});
