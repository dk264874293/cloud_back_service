import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConnectionOrder } from './entities/connection-order.entity';
import { EntrustmentOrder } from './entities/entrustment-order.entity';
import { OrderLog } from './entities/order-log.entity';
import { OrderStateMachine } from './order-status.service';
import { ConnectionOrderStatus, EntrustmentOrderStatus, OrderType } from '@/common/enums/order-status.enum';
import { User } from '@/modules/user/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(ConnectionOrder)
    private readonly connectionOrderRepository: Repository<ConnectionOrder>,
    @InjectRepository(EntrustmentOrder)
    private readonly entrustmentOrderRepository: Repository<EntrustmentOrder>,
    @InjectRepository(OrderLog)
    private readonly orderLogRepository: Repository<OrderLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly orderStateMachine: OrderStateMachine,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 记录订单变更日志
   */
  private async logOrderChange(params: {
    orderType: OrderType;
    orderId: number;
    action: string;
    operatorId?: number;
    operatorRole: string;
    beforeStatus?: string;
    afterStatus?: string;
    data?: Record<string, any>;
  }): Promise<OrderLog> {
    const log = this.orderLogRepository.create({
      orderType: params.orderType,
      orderId: params.orderId,
      action: params.action,
      operatorId: params.operatorId,
      operatorRole: params.operatorRole,
      beforeStatus: params.beforeStatus,
      afterStatus: params.afterStatus,
      data: params.data,
      createdAt: new Date(),
    });

    return await this.orderLogRepository.save(log);
  }

  /**
   * 创建对接订单
   */
  async createConnectionOrder(
    userId: number,
    data: {
      userType: string;
      needType: string;
      location: string;
      amount: number;
      repaymentAbility?: string;
    },
  ): Promise<ConnectionOrder> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 生成订单号
    const orderNo = `CO${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const order = this.connectionOrderRepository.create({
      order_no: orderNo,
      user,
      userId,
      status: ConnectionOrderStatus.PENDING_ASSIGN,
      userType: data.userType,
      needType: data.needType,
      location: data.location,
      amount: data.amount,
      repaymentAbility: data.repaymentAbility,
    });

    const savedOrder = await this.connectionOrderRepository.save(order) as ConnectionOrder;

    // 记录日志
    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: savedOrder.id,
      action: '创建订单',
      operatorId: userId,
      operatorRole: 'USER',
      afterStatus: ConnectionOrderStatus.PENDING_ASSIGN,
      data: { userType: data.userType, needType: data.needType, amount: data.amount },
    });

    return savedOrder;
  }

  /**
   * 分配管户人
   */
  async assignAccountManager(
    orderId: number,
    accountManagerId: number,
    operatorId: number,
    operatorRole: string,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== ConnectionOrderStatus.PENDING_ASSIGN) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const accountManager = await this.userRepository.findOne({ where: { id: accountManagerId } });
    if (!accountManager) {
      throw new NotFoundException('管户人不存在');
    }

    const beforeStatus = order.status;
    order.accountManagerId = accountManagerId;
    order.status = ConnectionOrderStatus.IN_REVIEW;

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '分配管户人',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: ConnectionOrderStatus.IN_REVIEW,
      data: { accountManagerId: accountManagerId },
    });

    return savedOrder;
  }

  /**
   * 上传客户需求报告
   */
  async uploadReport(
    orderId: number,
    reportUrl: string,
    operatorId: number,
    operatorRole: string,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== ConnectionOrderStatus.IN_REVIEW) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.reportUrl = reportUrl;
    order.status = ConnectionOrderStatus.WAITING_PURCHASE;

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '上传报告',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: ConnectionOrderStatus.WAITING_PURCHASE,
      data: { reportUrl: reportUrl },
    });

    return savedOrder;
  }

  /**
   * 设置价格和分配银行
   */
  async setPriceAndAssignBanks(
    orderId: number,
    price: number,
    assignedBanks: number[],
    operatorId: number,
    operatorRole: string,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== ConnectionOrderStatus.WAITING_PURCHASE) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.price = price;
    order.assignedBanks = assignedBanks;

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '设置价格和分配银行',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: ConnectionOrderStatus.WAITING_PURCHASE,
      data: { price: price, assignedBanks: assignedBanks },
    });

    return savedOrder;
  }

  /**
   * 管户人确认会议
   */
  async confirmMeeting(
    orderId: number,
    operatorId: number,
    operatorRole: string,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== ConnectionOrderStatus.WAITING_PURCHASE) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.status = ConnectionOrderStatus.IN_OFFLINE;

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '确认会议',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: ConnectionOrderStatus.IN_OFFLINE,
      data: {},
    });

    return savedOrder;
  }

  /**
   * 银行确认购买
   */
  async bankConfirm(
    orderId: number,
    bankManagerId: number,
    operatorRole: string,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!this.orderStateMachine.isConnectionBankPurchasable(order.status)) {
      throw new BadRequestException(`当前状态不允许银行购买，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;

    // 将银行ID添加到已购买列表
    if (!order.purchasedByBanks) {
      order.purchasedByBanks = [];
    }

    if (!order.purchasedByBanks.includes(bankManagerId)) {
      order.purchasedByBanks.push(bankManagerId);
    }

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '银行确认购买',
      operatorId: bankManagerId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: order.status,
      data: { bankManagerId: bankManagerId, purchasedBanks: order.purchasedByBanks },
    });

    return savedOrder;
  }

  /**
   * 用户选择银行
   */
  async selectBank(
    orderId: number,
    userId: number,
    selectedBankId: number,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== ConnectionOrderStatus.IN_OFFLINE) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    if (!order.purchasedByBanks || !order.purchasedByBanks.includes(selectedBankId)) {
      throw new BadRequestException('该银行尚未确认购买');
    }

    const beforeStatus = order.status;
    order.selectedBankId = selectedBankId;
    order.status = ConnectionOrderStatus.CONFIRMED;

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '用户选择银行',
      operatorId: userId,
      operatorRole: 'USER',
      beforeStatus: beforeStatus,
      afterStatus: ConnectionOrderStatus.CONFIRMED,
      data: { selectedBankId: selectedBankId },
    });

    return savedOrder;
  }

  /**
   * 创建委托订单
   */
  async createEntrustmentOrder(
    userId: number,
    connectionOrderId: number,
  ): Promise<EntrustmentOrder> {
    const connectionOrder = await this.connectionOrderRepository.findOne({
      where: { id: connectionOrderId },
    });

    if (!connectionOrder) {
      throw new NotFoundException('对接订单不存在');
    }

    if (connectionOrder.status !== ConnectionOrderStatus.CONFIRMED) {
      throw new BadRequestException('对接订单尚未确认，无法创建委托订单');
    }

    // 生成订单号
    const orderNo = `ET${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const entrustmentOrder = this.entrustmentOrderRepository.create({
      order_no: orderNo,
      connectionOrder,
      connectionOrderId,
      userId: connectionOrder.userId,
      status: EntrustmentOrderStatus.PENDING_REVIEW,
    });

    const savedOrder = await this.entrustmentOrderRepository.save(entrustmentOrder) as EntrustmentOrder;

    await this.logOrderChange({
      orderType: OrderType.ENTRUSTMENT,
      orderId: savedOrder.id,
      action: '创建委托订单',
      operatorId: userId,
      operatorRole: 'USER',
      afterStatus: EntrustmentOrderStatus.PENDING_REVIEW,
      data: { connectionOrderId: connectionOrderId },
    });

    return savedOrder;
  }

  /**
   * 上传委托协议
   */
  async uploadAgreement(
    orderId: number,
    agreementUrl: string,
    operatorId: number,
    operatorRole: string,
  ): Promise<EntrustmentOrder> {
    const order = await this.entrustmentOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== EntrustmentOrderStatus.PENDING_REVIEW) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.agreementUrl = agreementUrl;

    const savedOrder = await this.entrustmentOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.ENTRUSTMENT,
      orderId: orderId,
      action: '上传协议',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: order.status,
      data: { agreementUrl: agreementUrl },
    });

    return savedOrder;
  }

  /**
   * 审核委托订单
   */
  async approveEntrustmentOrder(
    orderId: number,
    approved: boolean,
    note: string,
    operatorId: number,
    operatorRole: string,
  ): Promise<EntrustmentOrder> {
    const order = await this.entrustmentOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== EntrustmentOrderStatus.PENDING_REVIEW) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.approvalNote = note;

    if (approved) {
      order.status = EntrustmentOrderStatus.APPROVED;
      order.rejectReason = '';
    } else {
      order.status = EntrustmentOrderStatus.REJECTED;
      order.rejectReason = note;
    }

    const savedOrder = await this.entrustmentOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.ENTRUSTMENT,
      orderId: orderId,
      action: approved ? '审核通过' : '审核拒绝',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: order.status,
      data: { approved: approved, note: note },
    });

    return savedOrder;
  }

  /**
   * 业务受理人接受委托
   */
  async acceptHandler(
    orderId: number,
    handlerId: number,
    operatorId: number,
    operatorRole: string,
  ): Promise<EntrustmentOrder> {
    const order = await this.entrustmentOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== EntrustmentOrderStatus.APPROVED) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.handlerId = handlerId;
    order.status = EntrustmentOrderStatus.PROCESSING;

    const savedOrder = await this.entrustmentOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.ENTRUSTMENT,
      orderId: orderId,
      action: '接受委托',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: EntrustmentOrderStatus.PROCESSING,
      data: { handlerId: handlerId },
    });

    return savedOrder;
  }

  /**
   * 完成委托订单
   */
  async completeEntrustmentOrder(
    orderId: number,
    completionNote: string,
    operatorId: number,
    operatorRole: string,
  ): Promise<EntrustmentOrder> {
    const order = await this.entrustmentOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== EntrustmentOrderStatus.PROCESSING) {
      throw new BadRequestException(`订单状态错误，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.completionNote = completionNote;
    order.status = EntrustmentOrderStatus.COMPLETED;

    const savedOrder = await this.entrustmentOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.ENTRUSTMENT,
      orderId: orderId,
      action: '完成委托',
      operatorId: operatorId,
      operatorRole: operatorRole,
      beforeStatus: beforeStatus,
      afterStatus: EntrustmentOrderStatus.COMPLETED,
      data: { completionNote: completionNote },
    });

    return savedOrder;
  }

  /**
   * 取消对接订单
   */
  async cancelConnectionOrder(
    orderId: number,
    userId: number,
    reason: string,
  ): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (!this.orderStateMachine.isConnectionCancelable(order.status)) {
      throw new BadRequestException(`当前状态不允许取消，当前状态：${order.status}`);
    }

    const beforeStatus = order.status;
    order.status = ConnectionOrderStatus.CANCELLED;
    order.cancelReason = reason;

    const savedOrder = await this.connectionOrderRepository.save(order);

    await this.logOrderChange({
      orderType: OrderType.CONNECTION,
      orderId: orderId,
      action: '取消订单',
      operatorId: userId,
      operatorRole: 'USER',
      beforeStatus: beforeStatus,
      afterStatus: ConnectionOrderStatus.CANCELLED,
      data: { reason: reason },
    });

    return savedOrder;
  }

  /**
   * 获取订单日志
   */
  async getOrderLogs(orderId: number, orderType: OrderType): Promise<OrderLog[]> {
    return await this.orderLogRepository.find({
      where: { orderId, orderType },
      relations: ['operator'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个对接订单详情
   */
  async getConnectionOrder(orderId: number): Promise<ConnectionOrder> {
    const order = await this.connectionOrderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'developer', 'accountManager', 'interviewer'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 获取银行池（可购买订单列表）
   */
  async getBankPool(): Promise<ConnectionOrder[]> {
    return await this.connectionOrderRepository.find({
      where: { status: ConnectionOrderStatus.WAITING_PURCHASE },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取用户的对接订单列表（分页）
   */
  async getConnectionOrders(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ orders: ConnectionOrder[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.connectionOrderRepository.findAndCount({
      where: { userId },
      relations: ['user', 'accountManager', 'interviewer'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { orders, total, page, limit };
  }
}
