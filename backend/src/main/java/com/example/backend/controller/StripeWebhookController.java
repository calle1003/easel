package com.example.backend.controller;

import com.example.backend.entity.ExchangeCode;
import com.example.backend.entity.Order;
import com.example.backend.repository.ExchangeCodeRepository;
import com.example.backend.repository.OrderRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhook")
public class StripeWebhookController {

  private final OrderRepository orderRepository;
  private final ExchangeCodeRepository exchangeCodeRepository;

  @Value("${stripe.webhook.secret:}")
  private String webhookSecret;

  public StripeWebhookController(OrderRepository orderRepository,
      ExchangeCodeRepository exchangeCodeRepository) {
    this.orderRepository = orderRepository;
    this.exchangeCodeRepository = exchangeCodeRepository;
  }

  /**
   * Stripe Webhookエンドポイント
   * POST /api/webhook/stripe
   */
  @PostMapping("/stripe")
  public ResponseEntity<String> handleStripeWebhook(
      @RequestBody String payload,
      @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

    Event event;

    try {
      // Webhook署名を検証
      if (webhookSecret != null && !webhookSecret.isEmpty() && sigHeader != null) {
        event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
      } else {
        System.out.println("⚠️ Webhook secret not configured. Use /api/webhook/test for testing.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Webhook secret not configured");
      }
    } catch (SignatureVerificationException e) {
      System.err.println("❌ Webhook signature verification failed: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
    } catch (Exception e) {
      System.err.println("❌ Webhook error: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error");
    }

    // イベントタイプに応じて処理
    String eventType = event.getType();
    System.out.println("📩 Received Stripe event: " + eventType);

    switch (eventType) {
      case "checkout.session.completed":
        handleCheckoutSessionCompleted(event);
        break;
      case "checkout.session.expired":
        handleCheckoutSessionExpired(event);
        break;
      case "payment_intent.payment_failed":
        handlePaymentFailed(event);
        break;
      default:
        System.out.println("ℹ️ Unhandled event type: " + eventType);
    }

    return ResponseEntity.ok("Received");
  }

  /**
   * checkout.session.completed イベントの処理
   * 決済が完了したとき
   */
  private void handleCheckoutSessionCompleted(Event event) {
    try {
      Session session = (Session) event.getDataObjectDeserializer()
          .getObject()
          .orElse(null);

      if (session == null) {
        System.err.println("❌ Failed to deserialize session");
        return;
      }

      processCompletedSession(session.getId(), session.getPaymentIntent());

    } catch (Exception e) {
      System.err.println("❌ Error processing checkout.session.completed: " + e.getMessage());
      e.printStackTrace();
    }
  }

  /**
   * セッション完了の処理（共通ロジック）
   */
  private void processCompletedSession(String sessionId, String paymentIntentId) {
    System.out.println("✅ Processing completed session: " + sessionId);

    // 注文を検索
    Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);

    if (orderOpt.isEmpty()) {
      System.err.println("❌ Order not found for session: " + sessionId);
      return;
    }

    Order order = orderOpt.get();

    // 既に支払い済みの場合はスキップ
    if (order.getStatus() == Order.OrderStatus.PAID) {
      System.out.println("ℹ️ Order already paid: " + order.getId());
      return;
    }

    // 注文ステータスを更新
    order.markAsPaid(paymentIntentId);
    orderRepository.save(order);

    System.out.println("✅ Order marked as paid: " + order.getId());

    // 引換券コードを使用済みにする
    markExchangeCodesAsUsed(order);

    System.out.println("✅ Order processing completed for: " + order.getId());
  }

  /**
   * 引換券コードを使用済みにする
   */
  private void markExchangeCodesAsUsed(Order order) {
    String codes = order.getExchangeCodes();
    if (codes == null || codes.isEmpty()) {
      return;
    }

    String[] codeArray = codes.split(",");
    for (String code : codeArray) {
      String trimmedCode = code.trim().toUpperCase();
      if (trimmedCode.isEmpty()) {
        continue;
      }

      Optional<ExchangeCode> exchangeCodeOpt = exchangeCodeRepository.findByCode(trimmedCode);
      if (exchangeCodeOpt.isPresent()) {
        ExchangeCode exchangeCode = exchangeCodeOpt.get();
        if (!exchangeCode.isUsed()) {
          exchangeCode.markAsUsed(order.getId());
          exchangeCodeRepository.save(exchangeCode);
          System.out.println("   ✅ Exchange code marked as used: " + trimmedCode);
        }
      }
    }
  }

  /**
   * checkout.session.expired イベントの処理
   * チェックアウトセッションが期限切れになったとき
   */
  private void handleCheckoutSessionExpired(Event event) {
    try {
      Session session = (Session) event.getDataObjectDeserializer()
          .getObject()
          .orElse(null);

      if (session == null) {
        return;
      }

      String sessionId = session.getId();
      System.out.println("⏰ Checkout session expired: " + sessionId);

      // 注文を検索してキャンセル
      Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);
      if (orderOpt.isPresent()) {
        Order order = orderOpt.get();
        if (order.getStatus() == Order.OrderStatus.PENDING) {
          order.markAsCancelled();
          orderRepository.save(order);
          System.out.println("   ✅ Order cancelled: " + order.getId());
        }
      }

    } catch (Exception e) {
      System.err.println("❌ Error processing checkout.session.expired: " + e.getMessage());
    }
  }

  /**
   * payment_intent.payment_failed イベントの処理
   * 決済が失敗したとき
   */
  private void handlePaymentFailed(Event event) {
    System.out.println("❌ Payment failed event received");
    // 必要に応じて通知を送信するなどの処理を追加
  }

  /**
   * Webhookテスト用エンドポイント（開発環境用）
   * POST /api/webhook/test
   * 
   * 使用方法:
   * curl -X POST http://localhost:8080/api/webhook/test \
   * -H "Content-Type: application/json" \
   * -d '{"sessionId": "cs_test_xxx"}'
   */
  @PostMapping("/test")
  public ResponseEntity<Map<String, Object>> testWebhook(@RequestBody Map<String, String> request) {
    String sessionId = request.get("sessionId");

    if (sessionId == null || sessionId.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of(
          "success", false,
          "error", "sessionId is required"));
    }

    Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);

    if (orderOpt.isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of(
          "success", false,
          "error", "Order not found for session: " + sessionId));
    }

    Order order = orderOpt.get();

    if (order.getStatus() == Order.OrderStatus.PAID) {
      return ResponseEntity.ok(Map.of(
          "success", true,
          "message", "Order already paid",
          "orderId", order.getId()));
    }

    // テスト用のPayment Intent IDを生成
    String testPaymentIntentId = "pi_test_" + System.currentTimeMillis();

    order.markAsPaid(testPaymentIntentId);
    orderRepository.save(order);

    markExchangeCodesAsUsed(order);

    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Order marked as paid (test)",
        "orderId", order.getId(),
        "paymentIntentId", testPaymentIntentId));
  }

  /**
   * Session IDで注文を手動で完了にする（開発環境用）
   * POST /api/webhook/complete-by-session
   */
  @PostMapping("/complete-by-session/{sessionId}")
  public ResponseEntity<Map<String, Object>> completeBySessionId(@PathVariable String sessionId) {
    Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);

    if (orderOpt.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Order order = orderOpt.get();

    if (order.getStatus() != Order.OrderStatus.PENDING) {
      return ResponseEntity.ok(Map.of(
          "success", false,
          "message", "Order is not pending",
          "status", order.getStatus().toString()));
    }

    processCompletedSession(sessionId, "pi_manual_" + System.currentTimeMillis());

    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Order completed",
        "orderId", order.getId()));
  }
}
