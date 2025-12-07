package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.entity.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Stripe Session IDで検索
    Optional<Order> findByStripeSessionId(String stripeSessionId);

    // Stripe Payment Intent IDで検索
    Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);

    // ステータスで検索
    List<Order> findByStatus(OrderStatus status);

    // 顧客メールで検索
    List<Order> findByCustomerEmail(String customerEmail);

    // 公演日で検索
    List<Order> findByPerformanceDate(String performanceDate);

    // ステータスと公演日で検索
    List<Order> findByStatusAndPerformanceDate(OrderStatus status, String performanceDate);

    // 期間内の注文を検索
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 支払い完了した注文を作成日時順で取得
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    // 顧客メールとステータスで検索
    List<Order> findByCustomerEmailAndStatus(String customerEmail, OrderStatus status);
}

