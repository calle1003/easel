package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * チケットEntity
 * 
 * 注文(Order)に紐づく個別のチケットを管理します。
 * 各チケットにはユニークなチケットコードが発行されます。
 */
@Entity
@Table(name = "tickets", indexes = {
    @Index(name = "idx_ticket_code", columnList = "ticket_code"),
    @Index(name = "idx_ticket_order", columnList = "order_id"),
    @Index(name = "idx_ticket_type", columnList = "ticket_type")
})
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 注文との関連
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * チケットコード（ユニーク）
     * UUID形式で自動生成
     */
    @Column(name = "ticket_code", nullable = false, unique = true, length = 36)
    private String ticketCode;

    /**
     * チケット種別
     * GENERAL: 一般席
     * RESERVED: 指定席
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ticket_type", nullable = false, length = 20)
    private TicketType ticketType;

    /**
     * 引換券利用フラグ
     * true: 引換券を利用して作成されたチケット（0円）
     * false: 通常購入のチケット
     */
    @Column(name = "is_exchanged", nullable = false)
    private boolean isExchanged = false;

    /**
     * 使用済みフラグ（入場時にチェック）
     */
    @Column(name = "is_used", nullable = false)
    private boolean isUsed = false;

    /**
     * 使用日時（入場日時）
     */
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    /**
     * 作成日時
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * チケット種別の列挙型
     */
    public enum TicketType {
        GENERAL,    // 一般席
        RESERVED    // 指定席
    }

    // ============================================
    // コンストラクタ
    // ============================================

    public Ticket() {
    }

    /**
     * 通常チケット作成用コンストラクタ
     */
    public Ticket(Order order, TicketType ticketType) {
        this.order = order;
        this.ticketCode = generateTicketCode();
        this.ticketType = ticketType;
        this.isExchanged = false;
        this.isUsed = false;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 引換券利用チケット作成用コンストラクタ
     */
    public Ticket(Order order, TicketType ticketType, boolean isExchanged) {
        this.order = order;
        this.ticketCode = generateTicketCode();
        this.ticketType = ticketType;
        this.isExchanged = isExchanged;
        this.isUsed = false;
        this.createdAt = LocalDateTime.now();
    }

    // ============================================
    // ライフサイクルコールバック
    // ============================================

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (ticketCode == null) {
            ticketCode = generateTicketCode();
        }
    }

    // ============================================
    // ビジネスロジック
    // ============================================

    /**
     * チケットコードを生成
     * @return UUID形式のチケットコード
     */
    private String generateTicketCode() {
        return UUID.randomUUID().toString();
    }

    /**
     * チケットを使用済みにする（入場処理）
     */
    public void markAsUsed() {
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
    }

    /**
     * チケットが有効かどうかを判定
     * @return 未使用かつ注文がPAID状態ならtrue
     */
    public boolean isValid() {
        return !isUsed && order != null && order.getStatus() == Order.OrderStatus.PAID;
    }

    // ============================================
    // Getters and Setters
    // ============================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public TicketType getTicketType() {
        return ticketType;
    }

    public void setTicketType(TicketType ticketType) {
        this.ticketType = ticketType;
    }

    public boolean isExchanged() {
        return isExchanged;
    }

    public void setExchanged(boolean exchanged) {
        isExchanged = exchanged;
    }

    public boolean isUsed() {
        return isUsed;
    }

    public void setUsed(boolean used) {
        isUsed = used;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ============================================
    // toString
    // ============================================

    @Override
    public String toString() {
        return "Ticket{" +
                "id=" + id +
                ", ticketCode='" + ticketCode + '\'' +
                ", ticketType=" + ticketType +
                ", isExchanged=" + isExchanged +
                ", isUsed=" + isUsed +
                ", orderId=" + (order != null ? order.getId() : null) +
                '}';
    }
}

