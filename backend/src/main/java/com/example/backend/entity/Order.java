package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 注文Entity
 * 
 * チケット購入の注文情報を管理します。
 * Stripe Checkoutセッションと連携し、決済状態を追跡します。
 */
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_stripe_session", columnList = "stripe_session_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_customer_email", columnList = "customer_email"),
    @Index(name = "idx_order_performance_date", columnList = "performance_date")
})
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // ============================================
  // Stripe関連
  // ============================================

  @Column(name = "stripe_session_id", unique = true)
  private String stripeSessionId;

  @Column(name = "stripe_payment_intent_id")
  private String stripePaymentIntentId;

  // ============================================
  // 公演情報
  // ============================================

  @Column(name = "performance_date", nullable = false, length = 50)
  private String performanceDate;

  @Column(name = "performance_label", length = 100)
  private String performanceLabel;

  // ============================================
  // チケット情報
  // ============================================

  @Column(name = "general_quantity", nullable = false)
  private int generalQuantity = 0;

  @Column(name = "reserved_quantity", nullable = false)
  private int reservedQuantity = 0;

  @Column(name = "general_price", nullable = false)
  private int generalPrice;

  @Column(name = "reserved_price", nullable = false)
  private int reservedPrice;

  // ============================================
  // 引換券情報
  // ============================================

  @Column(name = "discounted_general_count")
  private int discountedGeneralCount = 0;

  @Column(name = "discount_amount")
  private int discountAmount = 0;

  @Column(name = "exchange_codes", length = 500)
  private String exchangeCodes; // カンマ区切りで保存

  // ============================================
  // 金額
  // ============================================

  @Column(name = "total_amount", nullable = false)
  private int totalAmount;

  // ============================================
  // 顧客情報
  // ============================================

  @Column(name = "customer_name", nullable = false, length = 100)
  private String customerName;

  @Column(name = "customer_email", nullable = false)
  private String customerEmail;

  @Column(name = "customer_phone", length = 20)
  private String customerPhone;

  // ============================================
  // ステータス
  // ============================================

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OrderStatus status = OrderStatus.PENDING;

  // ============================================
  // タイムスタンプ
  // ============================================

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "paid_at")
  private LocalDateTime paidAt;

  @Column(name = "cancelled_at")
  private LocalDateTime cancelledAt;

  // ============================================
  // リレーション
  // ============================================

  /**
   * 注文に紐づくチケット一覧
   */
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<Ticket> tickets = new ArrayList<>();

  // ============================================
  // コンストラクタ
  // ============================================

  public Order() {
  }

  // ============================================
  // ライフサイクルコールバック
  // ============================================

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
  }

  // ============================================
  // ステータス変更メソッド
  // ============================================

  /**
   * 支払い完了状態にする
   */
  public void markAsPaid(String paymentIntentId) {
    this.status = OrderStatus.PAID;
    this.stripePaymentIntentId = paymentIntentId;
    this.paidAt = LocalDateTime.now();
  }

  /**
   * キャンセル状態にする
   */
  public void markAsCancelled() {
    this.status = OrderStatus.CANCELLED;
    this.cancelledAt = LocalDateTime.now();
  }

  /**
   * 返金済み状態にする
   */
  public void markAsRefunded() {
    this.status = OrderStatus.REFUNDED;
  }

  // ============================================
  // チケット管理メソッド
  // ============================================

  /**
   * チケットを追加
   */
  public void addTicket(Ticket ticket) {
    tickets.add(ticket);
    ticket.setOrder(this);
  }

  /**
   * チケットを削除
   */
  public void removeTicket(Ticket ticket) {
    tickets.remove(ticket);
    ticket.setOrder(null);
  }

  /**
   * 注文の総チケット数を取得
   */
  public int getTotalTicketCount() {
    return generalQuantity + reservedQuantity;
  }

  // ============================================
  // 引換券コード管理メソッド
  // ============================================

  /**
   * 引換券コードをリストとして取得
   */
  public List<String> getExchangeCodeList() {
    if (exchangeCodes == null || exchangeCodes.isEmpty()) {
      return Collections.emptyList();
    }
    return Arrays.asList(exchangeCodes.split(","));
  }

  /**
   * 引換券コードリストをセット
   */
  public void setExchangeCodeList(List<String> codes) {
    if (codes == null || codes.isEmpty()) {
      this.exchangeCodes = null;
    } else {
      this.exchangeCodes = String.join(",", codes);
    }
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getStripeSessionId() {
    return stripeSessionId;
  }

  public void setStripeSessionId(String stripeSessionId) {
    this.stripeSessionId = stripeSessionId;
  }

  public String getStripePaymentIntentId() {
    return stripePaymentIntentId;
  }

  public void setStripePaymentIntentId(String stripePaymentIntentId) {
    this.stripePaymentIntentId = stripePaymentIntentId;
  }

  public String getPerformanceDate() {
    return performanceDate;
  }

  public void setPerformanceDate(String performanceDate) {
    this.performanceDate = performanceDate;
  }

  public String getPerformanceLabel() {
    return performanceLabel;
  }

  public void setPerformanceLabel(String performanceLabel) {
    this.performanceLabel = performanceLabel;
  }

  public int getGeneralQuantity() {
    return generalQuantity;
  }

  public void setGeneralQuantity(int generalQuantity) {
    this.generalQuantity = generalQuantity;
  }

  public int getReservedQuantity() {
    return reservedQuantity;
  }

  public void setReservedQuantity(int reservedQuantity) {
    this.reservedQuantity = reservedQuantity;
  }

  public int getGeneralPrice() {
    return generalPrice;
  }

  public void setGeneralPrice(int generalPrice) {
    this.generalPrice = generalPrice;
  }

  public int getReservedPrice() {
    return reservedPrice;
  }

  public void setReservedPrice(int reservedPrice) {
    this.reservedPrice = reservedPrice;
  }

  public int getDiscountedGeneralCount() {
    return discountedGeneralCount;
  }

  public void setDiscountedGeneralCount(int discountedGeneralCount) {
    this.discountedGeneralCount = discountedGeneralCount;
  }

  public int getDiscountAmount() {
    return discountAmount;
  }

  public void setDiscountAmount(int discountAmount) {
    this.discountAmount = discountAmount;
  }

  public String getExchangeCodes() {
    return exchangeCodes;
  }

  public void setExchangeCodes(String exchangeCodes) {
    this.exchangeCodes = exchangeCodes;
  }

  public int getTotalAmount() {
    return totalAmount;
  }

  public void setTotalAmount(int totalAmount) {
    this.totalAmount = totalAmount;
  }

  public String getCustomerName() {
    return customerName;
  }

  public void setCustomerName(String customerName) {
    this.customerName = customerName;
  }

  public String getCustomerEmail() {
    return customerEmail;
  }

  public void setCustomerEmail(String customerEmail) {
    this.customerEmail = customerEmail;
  }

  public String getCustomerPhone() {
    return customerPhone;
  }

  public void setCustomerPhone(String customerPhone) {
    this.customerPhone = customerPhone;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public void setStatus(OrderStatus status) {
    this.status = status;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getPaidAt() {
    return paidAt;
  }

  public void setPaidAt(LocalDateTime paidAt) {
    this.paidAt = paidAt;
  }

  public LocalDateTime getCancelledAt() {
    return cancelledAt;
  }

  public void setCancelledAt(LocalDateTime cancelledAt) {
    this.cancelledAt = cancelledAt;
  }

  public List<Ticket> getTickets() {
    return tickets;
  }

  public void setTickets(List<Ticket> tickets) {
    this.tickets = tickets;
  }

  // ============================================
  // toString
  // ============================================

  @Override
  public String toString() {
    return "Order{" +
        "id=" + id +
        ", stripeSessionId='" + stripeSessionId + '\'' +
        ", performanceDate='" + performanceDate + '\'' +
        ", generalQuantity=" + generalQuantity +
        ", reservedQuantity=" + reservedQuantity +
        ", totalAmount=" + totalAmount +
        ", customerName='" + customerName + '\'' +
        ", customerEmail='" + customerEmail + '\'' +
        ", status=" + status +
        ", ticketCount=" + (tickets != null ? tickets.size() : 0) +
        '}';
  }

  // ============================================
  // 注文ステータス列挙型
  // ============================================

  /**
   * 注文ステータス
   */
  public enum OrderStatus {
    /** 決済待ち */
    PENDING,
    /** 支払い完了 */
    PAID,
    /** キャンセル */
    CANCELLED,
    /** 返金済み */
    REFUNDED
  }
}
