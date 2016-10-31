'use strict';

const EVENTS = require('./helpers/enum/events');

class Messenger {

  constructor(cementHelper, logger) {
    this.cementHelper = cementHelper;
    this.logger = logger;
  }

  getAllMessagesFromQueue(queue) {
    const messages = [];
    const messaging = this.cementHelper.dependencies.messaging;
    const getMessages = function() {
      return messaging.get({queue: queue, ack: 'auto'})
        .then((data) => {
          const json = data.result.json;
          if(json !== null) {
            messages.push(json);
            return getMessages();
          }
        });
    }

    return getMessages().then(() => messages);
  }

  /**
   *
   * @param message
   * @param queue
   * @param options { autoDetele: true, expires: 1000 }
   * @returns {Promise}
   */
  sendOneMessageToOneQueue(message, queue, options) {
    const that = this;
    return new Promise((resolve, reject) => {
      const payload = {
        queue: queue,
        message: message
      }
      if(options) {
        if(typeof options.autoDelete !== 'undefined') {
          payload.autoDelete = options.autoDelete;
        }
        if(typeof options.expires !== 'undefined') {
          payload.expires = options.expires;
        }
      }
      const sentContext = that.cementHelper.createContext({
        nature: {
          type: 'message',
          quality: 'produce'
        },
        payload: {
          queue: queue,
          message: message
        }
      });
      sentContext.on(EVENTS.DONE, (brickName, response) => {
        resolve({
          returnCode: EVENTS.DONE,
          brickName: brickName,
          response: response
        });
      });
      sentContext.on(EVENTS.REJECT, (brickName, err) => {
        reject({
          returnCode: EVENTS.REJECT,
          brickName: brickName,
          response: err
        });
      });
      sentContext.on(EVENTS.ERROR, (brickName, err) => {
        reject({
          returnCode: EVENTS.ERROR,
          brickName: brickName,
          response: err
        });
      });
      sentContext.publish();
    });
  }

  sendOneMessageToManyQueues(message, queues, options) {
    const that = this;
    let promise = Promise.resolve();
    queues.forEach((queue) => {
      promise = promise.then(() => {
        return that.sendOneMessageToOneQueue(message, queue, options);
      });
    });

    return promise;
  }

  sendManyMessagesToOneQueue(messages, queue, options) {
    const that = this;
    let promise = Promise.resolve();
    messages.forEach((message) => {
      promise = promise.then(() => {
        return that.sendOneMessageToOneQueue(message, queue, options);
      });
    });

    return promise;
  }

  acknowledgeMessage(ackId) {
    const that = this;
    return new Promise((resolve, reject) => {
      const sentContext = that.cementHelper.createContext({
        nature: {
          type: 'message',
          quality: 'acknowledge'
        },
        payload: {
          id: ackId
        }
      });
      sentContext.on(EVENTS.DONE, (brickName, response) => {
        resolve({
          returnCode: EVENTS.DONE,
          brickName: brickName,
          response: response
        });
      });
      sentContext.on(EVENTS.REJECT, (brickName, err) => {
        reject({
          returnCode: EVENTS.REJECT,
          brickName: brickName,
          response: err
        });
      });
      sentContext.on(EVENTS.ERROR, (brickName, err) => {
        reject({
          returnCode: EVENTS.ERROR,
          brickName: brickName,
          response: err
        });
      });
      sentContext.publish();
    });
  }
}

module.exports = Messenger;