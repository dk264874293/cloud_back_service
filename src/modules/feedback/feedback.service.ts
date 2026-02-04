import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, FeedbackStatus } from './feedback.entity';
import { User } from '../user/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async createFeedback(
    userId: number,
    content: string,
    images?: string[],
  ): Promise<Feedback> {
    const feedback = new Feedback();
    feedback.userId = userId;
    feedback.content = content;
    feedback.images = images || [];
    feedback.status = FeedbackStatus.PENDING;

    return await this.feedbackRepository.save(feedback);
  }

  async getFeedbacksByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    feedbacks: Feedback[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await this.feedbackRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { feedbacks, total, page, limit };
  }

  async getAllFeedbacks(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    feedbacks: Feedback[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await this.feedbackRepository.findAndCount({
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { feedbacks, total, page, limit };
  }

  async replyFeedback(
    feedbackId: number,
    reply: string,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('反馈不存在');
    }

    feedback.reply = reply;
    feedback.status = FeedbackStatus.RESOLVED;
    feedback.repliedAt = new Date();

    return await this.feedbackRepository.save(feedback);
  }

  async updateFeedbackStatus(
    feedbackId: number,
    status: FeedbackStatus,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('反馈不存在');
    }

    feedback.status = status;

    if (status === FeedbackStatus.RESOLVED && feedback.reply) {
      feedback.repliedAt = new Date();
    }

    return await this.feedbackRepository.save(feedback);
  }

  async deleteFeedback(feedbackId: number): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('反馈不存在');
    }

    await this.feedbackRepository.delete(feedbackId);
  }
}
