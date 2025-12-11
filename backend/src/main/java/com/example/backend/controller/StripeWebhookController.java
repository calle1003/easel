package com.example.backend.controller;

import com.example.backend.entity.ExchangeCode;
import com.example.backend.entity.Order;
import com.example.backend.entity.Ticket;
import com.example.backend.entity.Ticket.TicketType;
import com.example.backend.repository.ExchangeCodeRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.service.EmailService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Stripe Webhookコントローラー
 * 
 * Stripeからのイベント通知を処理し、注文ステータスの更新とチケット発行を行います。
 */
@RestController
@RequestMapping("/api/webhook")
public class StripeWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookController.class);

    private final OrderRepository orderRepository;
    private final ExchangeCodeRepository exchangeCodeRepository;
    private final TicketRepository ticketRepository;
    private final EmailService emailService;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    public StripeWebhookController(
            OrderRepository orderRepository,
            ExchangeCodeRepository exchangeCodeRepository,
            TicketRepository ticketRepository,
            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.exchangeCodeRepository = exchangeCodeRepository;
        this.ticketRepository = ticketRepository;
        this.emailService = emailService;
    }

    // ============================================
    // POST /api/webhook/stripe
    // ============================================

    /**
     * Stripe Webhookエンドポイント
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
                logger.warn("Webhook secret not configured. Skipping signature verification.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Webhook secret not configured");
            }
        } catch (SignatureVerificationException e) {
            logger.error("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            logger.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error");
        }

        // イベントタイプに応じて処理
        String eventType = event.getType();
        logger.info("Received Stripe event: {}", eventType);

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
                logger.info("Unhandled event type: {}", eventType);
        }

        return ResponseEntity.ok("Received");
    }

    // ============================================
    // イベントハンドラー
    // ============================================

    /**
     * checkout.session.completed イベントの処理
     */
    private void handleCheckoutSessionCompleted(Event event) {
        try {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);

            if (session == null) {
                logger.error("Failed to deserialize session");
                return;
            }

            processCompletedSession(session.getId(), session.getPaymentIntent());

        } catch (Exception e) {
            logger.error("Error processing checkout.session.completed: {}", e.getMessage(), e);
        }
    }

    /**
     * checkout.session.expired イベントの処理
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
            logger.info("Checkout session expired: {}", sessionId);

            Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                if (order.getStatus() == Order.OrderStatus.PENDING) {
                    order.markAsCancelled();
                    orderRepository.save(order);
                    logger.info("Order cancelled due to session expiry: {}", order.getId());
                }
            }

        } catch (Exception e) {
            logger.error("Error processing checkout.session.expired: {}", e.getMessage(), e);
        }
    }

    /**
     * payment_intent.payment_failed イベントの処理
     */
    private void handlePaymentFailed(Event event) {
        logger.warn("Payment failed event received");
        // 必要に応じてメール通知などを追加
    }

    // ============================================
    // 決済完了処理
    // ============================================

    /**
     * セッション完了の処理
     */
    @Transactional
    public void processCompletedSession(String sessionId, String paymentIntentId) {
        logger.info("Processing completed session: {}", sessionId);

        // 注文を検索
        Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);

        if (orderOpt.isEmpty()) {
            logger.error("Order not found for session: {}", sessionId);
            return;
        }

        Order order = orderOpt.get();

        // 既に支払い済みの場合はスキップ
        if (order.getStatus() == Order.OrderStatus.PAID) {
            logger.info("Order already paid: {}", order.getId());
            return;
        }

        // 1. 注文ステータスを更新
        order.markAsPaid(paymentIntentId);
        orderRepository.save(order);
        logger.info("Order marked as paid: {}", order.getId());

        // 2. 引換券コードを使用済みにする
        markExchangeCodesAsUsed(order);

        // 3. チケットを発行
        List<Ticket> tickets = issueTickets(order);

        // 4. 購入完了メールを送信
        sendPurchaseConfirmationEmail(order, tickets);

        logger.info("Order processing completed: {}", order.getId());
    }

    /**
     * 購入完了メールを送信
     */
    private void sendPurchaseConfirmationEmail(Order order, List<Ticket> tickets) {
        try {
            emailService.sendPurchaseConfirmationEmail(order, tickets);
            logger.info("Purchase confirmation email queued for: {}", order.getCustomerEmail());
        } catch (Exception e) {
            // メール送信の失敗は注文処理には影響させない
            logger.error("Failed to queue purchase confirmation email: {}", e.getMessage());
        }
    }

    /**
     * 引換券コードを使用済みにする
     */
    private void markExchangeCodesAsUsed(Order order) {
        List<String> codes = order.getExchangeCodeList();
        if (codes.isEmpty()) {
            return;
        }

        for (String code : codes) {
            String normalizedCode = code.trim().toUpperCase();
            if (normalizedCode.isEmpty()) {
                continue;
            }

            Optional<ExchangeCode> exchangeCodeOpt = exchangeCodeRepository.findByCode(normalizedCode);
            if (exchangeCodeOpt.isPresent()) {
                ExchangeCode exchangeCode = exchangeCodeOpt.get();
                if (!exchangeCode.isUsed()) {
                    exchangeCode.markAsUsed(order.getId());
                    exchangeCodeRepository.save(exchangeCode);
                    logger.info("Exchange code marked as used: {}", normalizedCode);
                }
            }
        }
    }

    /**
     * チケットを発行
     * @return 発行されたチケットのリスト
     */
    private List<Ticket> issueTickets(Order order) {
        List<Ticket> tickets = new ArrayList<>();
        int discountedCount = order.getDiscountedGeneralCount();
        int issuedDiscountedCount = 0;

        // 一般席チケットを発行
        for (int i = 0; i < order.getGeneralQuantity(); i++) {
            boolean isExchanged = issuedDiscountedCount < discountedCount;
            Ticket ticket = new Ticket(order, TicketType.GENERAL, isExchanged);
            tickets.add(ticket);
            if (isExchanged) {
                issuedDiscountedCount++;
            }
        }

        // 指定席チケットを発行
        for (int i = 0; i < order.getReservedQuantity(); i++) {
            Ticket ticket = new Ticket(order, TicketType.RESERVED, false);
            tickets.add(ticket);
        }

        // 保存
        ticketRepository.saveAll(tickets);
        logger.info("Issued {} tickets for order {}", tickets.size(), order.getId());

        // チケットコードをログ出力（デバッグ用）
        for (Ticket ticket : tickets) {
            logger.debug("Ticket issued: code={}, type={}, exchanged={}",
                    ticket.getTicketCode(), ticket.getTicketType(), ticket.isExchanged());
        }

        return tickets;
    }

    // ============================================
    // テスト用エンドポイント（開発環境用）
    // ============================================

    /**
     * Webhookテスト用エンドポイント
     * POST /api/webhook/test
     */
    @PostMapping("/test")
    @Transactional
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
            // 既に支払い済みの場合、発行済みチケット情報を返す
            List<Ticket> tickets = ticketRepository.findByOrder(order);
            List<String> ticketCodes = tickets.stream()
                    .map(Ticket::getTicketCode)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order already paid",
                    "orderId", order.getId(),
                    "ticketCount", tickets.size(),
                    "ticketCodes", ticketCodes));
        }

        // テスト用のPayment Intent IDを生成
        String testPaymentIntentId = "pi_test_" + System.currentTimeMillis();

        // 決済完了処理を実行
        processCompletedSession(sessionId, testPaymentIntentId);

        // 発行されたチケットを取得
        List<Ticket> tickets = ticketRepository.findByOrder(order);
        List<String> ticketCodes = tickets.stream()
                .map(Ticket::getTicketCode)
                .toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order marked as paid (test)",
                "orderId", order.getId(),
                "paymentIntentId", testPaymentIntentId,
                "ticketCount", tickets.size(),
                "ticketCodes", ticketCodes));
    }

    /**
     * Session IDで注文を手動で完了にする（開発環境用）
     * POST /api/webhook/complete-by-session/{sessionId}
     */
    @PostMapping("/complete-by-session/{sessionId}")
    @Transactional
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

        // 発行されたチケットを取得
        List<Ticket> tickets = ticketRepository.findByOrder(order);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order completed",
                "orderId", order.getId(),
                "ticketCount", tickets.size()));
    }

    /**
     * 注文のチケット一覧を取得（確認用）
     * GET /api/webhook/tickets/{orderId}
     */
    @GetMapping("/tickets/{orderId}")
    public ResponseEntity<Map<String, Object>> getTickets(@PathVariable @NonNull Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        List<Ticket> tickets = ticketRepository.findByOrder(order);

        List<Map<String, Object>> ticketList = tickets.stream()
                .map(t -> Map.<String, Object>of(
                        "id", t.getId(),
                        "ticketCode", t.getTicketCode(),
                        "ticketType", t.getTicketType().toString(),
                        "isExchanged", t.isExchanged(),
                        "isUsed", t.isUsed(),
                        "isValid", t.isValid()))
                .toList();

        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "orderStatus", order.getStatus().toString(),
                "ticketCount", tickets.size(),
                "tickets", ticketList));
    }
}
