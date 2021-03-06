/* @flow */

import Analytics, {__logger, __mixpanel} from '../Analytics';

jest.unmock('../Analytics');
jest.mock('mixpanel', () => ({
  init: () => ({
    people: {
      set: jest.fn(
        (
          distinctId: string,
          props: {[key: string]: mixed},
          callback: (err: ?Error) => void,
        ) => {
          callback();
        },
      ),
    },
    track: jest.fn(
      (
        event: string,
        props: {[key: string]: mixed},
        callback: (err: ?Error) => void,
      ) => {
        callback();
      },
    ),
  }),
}));

describe('Analytics', () => {
  beforeEach(() => {
    __mixpanel.people.set.mockClear();
    __mixpanel.track.mockClear();
    __logger.error.mockClear();
  });

  it('tracks a user', async () => {
    await Analytics.trackUser({id: '123'});

    expect(__mixpanel.people.set).toHaveBeenCalled();
    expect(__mixpanel.track).not.toHaveBeenCalled();
  });

  it('catches error if tracking a user fails', async () => {
    __mixpanel.people.set.mockImplementationOnce(
      (
        distinctId: string,
        props: {[key: string]: mixed},
        callback: (err: ?Error) => void,
      ) => {
        callback(new Error());
      },
    );

    await Analytics.trackUser({id: '123'});

    expect(__logger.error).toHaveBeenCalled();
  });

  it('tracks an event ', async () => {
    await Analytics.trackEvent('123', 'test');

    expect(__mixpanel.people.set).not.toHaveBeenCalled();
    expect(__mixpanel.track).toHaveBeenCalled();
  });

  it('catches error if tracking an event fails', async () => {
    __mixpanel.track.mockImplementationOnce(
      (
        event: string,
        props: {[key: string]: mixed},
        callback: (err: ?Error) => void,
      ) => {
        callback(new Error());
      },
    );

    await Analytics.trackEvent('123', 'test');

    expect(__logger.error).toHaveBeenCalled();
  });
});
