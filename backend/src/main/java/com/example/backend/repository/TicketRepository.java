package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.entity.Ticket;
import com.example.backend.entity.Ticket.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * チケットリポジトリ
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ============================================
    // 基本検索
    // ============================================

    /**
     * チケットコードで検索
     */
    Optional<Ticket> findByTicketCode(String ticketCode);

    /**
     * 注文IDで検索
     */
    List<Ticket> findByOrderId(Long orderId);

    /**
     * 注文で検索
     */
    List<Ticket> findByOrder(Order order);

    // ============================================
    // チケット種別検索
    // ============================================

    /**
     * チケット種別で検索
     */
    List<Ticket> findByTicketType(TicketType ticketType);

    /**
     * 注文とチケット種別で検索
     */
    List<Ticket> findByOrderAndTicketType(Order order, TicketType ticketType);

    // ============================================
    // 引換券関連検索
    // ============================================

    /**
     * 引換券利用チケットを検索
     */
    List<Ticket> findByIsExchangedTrue();

    /**
     * 注文の引換券利用チケットを検索
     */
    List<Ticket> findByOrderAndIsExchangedTrue(Order order);

    /**
     * 注文の通常購入チケットを検索
     */
    List<Ticket> findByOrderAndIsExchangedFalse(Order order);

    // ============================================
    // 使用状況検索
    // ============================================

    /**
     * 未使用のチケットを検索
     */
    List<Ticket> findByIsUsedFalse();

    /**
     * 使用済みのチケットを検索
     */
    List<Ticket> findByIsUsedTrue();

    /**
     * 注文の未使用チケットを検索
     */
    List<Ticket> findByOrderAndIsUsedFalse(Order order);

    /**
     * 注文の使用済みチケットを検索
     */
    List<Ticket> findByOrderAndIsUsedTrue(Order order);

    // ============================================
    // 有効性チェック
    // ============================================

    /**
     * チケットコードが存在するかチェック
     */
    boolean existsByTicketCode(String ticketCode);

    /**
     * 有効なチケットを検索（未使用かつ注文がPAID状態）
     */
    @Query("SELECT t FROM Ticket t WHERE t.ticketCode = :ticketCode AND t.isUsed = false AND t.order.status = 'PAID'")
    Optional<Ticket> findValidTicketByCode(@Param("ticketCode") String ticketCode);

    // ============================================
    // 集計クエリ
    // ============================================

    /**
     * 注文のチケット数をカウント
     */
    long countByOrder(Order order);

    /**
     * 注文の種別ごとのチケット数をカウント
     */
    long countByOrderAndTicketType(Order order, TicketType ticketType);

    /**
     * 注文の引換券利用チケット数をカウント
     */
    long countByOrderAndIsExchangedTrue(Order order);

    /**
     * 注文の使用済みチケット数をカウント
     */
    long countByOrderAndIsUsedTrue(Order order);

    // ============================================
    // 公演日検索（Orderを経由）
    // ============================================

    /**
     * 公演日でチケットを検索
     */
    @Query("SELECT t FROM Ticket t WHERE t.order.performanceDate = :performanceDate")
    List<Ticket> findByPerformanceDate(@Param("performanceDate") String performanceDate);

    /**
     * 公演日で有効なチケットを検索
     */
    @Query("SELECT t FROM Ticket t WHERE t.order.performanceDate = :performanceDate AND t.isUsed = false AND t.order.status = 'PAID'")
    List<Ticket> findValidTicketsByPerformanceDate(@Param("performanceDate") String performanceDate);

    /**
     * 公演日の使用済みチケット数をカウント
     */
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.order.performanceDate = :performanceDate AND t.isUsed = true")
    long countUsedTicketsByPerformanceDate(@Param("performanceDate") String performanceDate);

    /**
     * 公演日の総チケット数をカウント（PAID注文のみ）
     */
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.order.performanceDate = :performanceDate AND t.order.status = 'PAID'")
    long countTotalTicketsByPerformanceDate(@Param("performanceDate") String performanceDate);
}

