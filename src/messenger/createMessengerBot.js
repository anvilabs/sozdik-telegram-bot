/* @flow */

import _ from 'lodash/fp';

import createLogger from '../createLogger';
import curriedmakeHandleMessage from './makeHandleMessage';
import env from '../env';
import messengerPlatform from './messengerPlatform';
import sozdikApi from '../sozdikApi';
import type {MessagingType} from './types';

type WebhookCallbackType = {
  entry: Array<{messaging: Array<MessagingType>}>,
};

const {fbWebhookVerifyToken} = env;
const {getTranslationsForQuery} = sozdikApi('facebook');
const logger = createLogger('messenger');

const createMessengerBot = () => {
  const platform = messengerPlatform(logger);
  const {
    sendTextMessage,
    sendSenderAction,
    setGreetingText,
    getUserProfile,
  } = platform;

  const makeHandleMessage = curriedmakeHandleMessage({
    sendTextMessage,
    sendSenderAction,
    getUserProfile,
    getTranslationsForQuery,
    logger,
  });

  return {
    verifyWebhook: (query: {[key: string]: any}) =>
      query['hub.mode'] === 'subscribe' &&
      query['hub.verify_token'] === fbWebhookVerifyToken,
    handleWebhookCallback: (callback: WebhookCallbackType) =>
      _.flow(
        _.flatMap('messaging'),
        _.forEach((messaging: MessagingType) => {
          if (messaging.message) {
            makeHandleMessage({
              recipientId: messaging.sender.id,
              message: messaging.message,
            });
          }
        }),
      )(callback.entry),
    setUp: () => {
      setGreetingText('Просто введи слово, фразу или число, и я переведу.');
    },
    __platform: platform,
    __handleMessage: makeHandleMessage,
  };
};

export default createMessengerBot;
