import { smpteTimecodeToFrames } from './transcode';

describe('SMPTE timecode to frames', () => {
  it('should convert SMPTE timecode to frames', () => {
    const frameRate = 24;
    const smpteTimeCode = '01:02:03:04';
    const totalFrames = smpteTimecodeToFrames(smpteTimeCode, frameRate);
    expect(totalFrames).toBe(89356);
  });
});
