import * as process from 'process';

export default () => ({
  sqs: {
    queues: {
      email: {
        name: process.env.AWS_SQS_QUEUE_EMAIL,
        url: `${process.env.AWS_SQS_PREFIX}${process.env.AWS_SQS_QUEUE_EMAIL}`,
        region: 'us-east-1',
      },
    },
  },
});
