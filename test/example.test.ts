import { expect } from 'chai';
import 'mocha';

describe('Example Test Suite', () => {
    it('should pass', () => {
        expect(true).to.equal(true);
    });

    it('should fail', () => {
        expect(false).to.equal(true);
    });
});
