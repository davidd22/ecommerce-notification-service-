import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InternalMessageQueueService {
  constructor(private readonly sqsService: SqsService) {}

  async publish(body: any, queueName: string) {
    const message: any = JSON.stringify(body);

    const result = await this.sqsService.send(queueName, {
      id: uuidv4(),
      body: message,
    });

    console.log({ publish: { queueName: queueName, message: message } });

    return result;
  }
}
