import {
  smpteTimecodeToFrames,
  transcode,
  TranscodeOptions
} from './transcode';
import { Context } from '@osaas/client-core';
import { getEncoreInstance } from '@osaas/client-services';

// Mock dependencies
jest.mock('@osaas/client-services', () => ({
  getEncoreInstance: jest.fn()
}));

jest.mock('@osaas/client-core', () => ({
  Log: () => ({
    debug: jest.fn()
  })
}));

// Mock fetch
global.fetch = jest.fn();

describe('SMPTE timecode to frames', () => {
  it('should convert SMPTE timecode to frames', () => {
    const frameRate = 24;
    const smpteTimeCode = '01:02:03:04';
    const totalFrames = smpteTimecodeToFrames(smpteTimeCode, frameRate);
    expect(totalFrames).toBe(89356);
  });
});

describe('transcode with audioMixPreset', () => {
  let mockContext: Context;
  let mockGetEncoreInstance: jest.Mock;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockContext = {
      getServiceAccessToken: jest.fn().mockResolvedValue('test-token')
    } as any;

    mockGetEncoreInstance = getEncoreInstance as jest.Mock;
    mockGetEncoreInstance.mockResolvedValue({
      url: 'https://test-encore.example.com'
    });

    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'test-job-id' })
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should include audioMixPreset in profileParams when provided', async () => {
    const options: TranscodeOptions = {
      encoreInstanceName: 'test-instance',
      externalId: 'test-id',
      inputUrl: new URL('s3://input/test.mp4'),
      outputUrl: new URL('s3://output/'),
      audioMixPreset: 'stereo'
    };

    await transcode(mockContext, options);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('/encoreJobs', 'https://test-encore.example.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        }),
        body: expect.stringContaining('"audioMixPreset":"stereo"')
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1]?.body as string);
    expect(requestBody.profileParams).toEqual({
      audioMixPreset: 'stereo'
    });
  });

  it('should include audioMixPreset alongside keyframes in profileParams', async () => {
    const options: TranscodeOptions = {
      encoreInstanceName: 'test-instance',
      externalId: 'test-id',
      inputUrl: new URL('s3://input/test.mp4'),
      outputUrl: new URL('s3://output/'),
      audioMixPreset: '5.1-surround',
      frameRate: 24,
      injectIDRKeyFrames: [{ smpteTimeCode: '00:00:01:00' }]
    };

    await transcode(mockContext, options);

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1]?.body as string);
    expect(requestBody.profileParams).toEqual({
      keyframes: 'expr:not(mod(n,96))+eq(n,24)',
      audioMixPreset: '5.1-surround'
    });
  });

  it('should not include profileParams when audioMixPreset is not provided', async () => {
    const options: TranscodeOptions = {
      encoreInstanceName: 'test-instance',
      externalId: 'test-id',
      inputUrl: new URL('s3://input/test.mp4'),
      outputUrl: new URL('s3://output/')
    };

    await transcode(mockContext, options);

    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1]?.body as string);
    expect(requestBody.profileParams).toBeUndefined();
  });

  it('should handle various audioMixPreset values', async () => {
    const testCases = [
      'mono',
      'stereo',
      '5.1-surround',
      '7.1-surround',
      'custom-preset'
    ];

    for (const preset of testCases) {
      const options: TranscodeOptions = {
        encoreInstanceName: 'test-instance',
        externalId: 'test-id',
        inputUrl: new URL('s3://input/test.mp4'),
        outputUrl: new URL('s3://output/'),
        audioMixPreset: preset
      };

      await transcode(mockContext, options);

      const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      expect(requestBody.profileParams.audioMixPreset).toBe(preset);
    }
  });
});
