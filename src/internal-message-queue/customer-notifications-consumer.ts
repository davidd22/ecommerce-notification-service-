import { DeleteMessageCommand, Message, SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';

import { ConfigService } from '@nestjs/config';
import { InternalMessageQueueService } from './internal-message-queue.service';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomerNotificationsConsumer {
  private readonly queueUrl;
  private readonly sqsClient: SQSClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly internalMessageQueueService: InternalMessageQueueService,
  ) {
    this.queueUrl = `${process.env.AWS_SQS_PREFIX}/${process.env.AWS_SQS_QUEUE_EMAIL}`;

    const endpoint: string = new URL(process.env.AWS_SQS_PREFIX).origin;

    this.sqsClient = new SQSClient({
      region: process.env.AWS_SQS_REGION,
      endpoint,
    });
  }

  @SqsMessageHandler(/** name: */ `ecommerce-email`, /** batch: */ false)
  public async handleMessage(message: Message) {
    try {
      const msg: any = JSON.parse(message.Body);
      msg.emailConfirmation = uuidv4();

      console.log('send email with tracking id to customer :', msg);
      await this.deleteMessage(message, this.queueUrl);

      await this.internalMessageQueueService.publish(
        msg,
        process.env.AWS_SQS_QUEUE_MONITOR,
      );
    } catch (e) {
      throw e;
    } finally {
    }
  }

  @SqsConsumerEventHandler(
    /** name: */ 'ecommerce-email',
    /** eventName: */ 'processing_error',
  )
  public onProcessingError(error: Error, message: Message) {
    console.log(error);
  }

  async deleteMessage(message, queueUrl: string) {
    try {
      const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      });

      await this.sqsClient.send(deleteMessageCommand);
    } catch (e) {
      throw e;
    }
  }
}
