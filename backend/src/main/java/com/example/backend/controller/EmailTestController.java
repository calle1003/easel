package com.example.backend.controller;

import com.example.backend.entity.Order;
import com.example.backend.entity.Ticket;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TicketRepository;
import com.example.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * メールテスト用コントローラー（開発環境用）
 * 
 * 本番環境では無効化またはアクセス制限を設けてください。
 */
@RestController
@RequestMapping("/api/test/email")
public class EmailTestController {

    private static final Logger logger = LoggerFactory.getLogger(EmailTestController.class);

    private final EmailService emailService;
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;

    public EmailTestController(
            EmailService emailService,
            OrderRepository orderRepository,
            TicketRepository ticketRepository) {
        this.emailService = emailService;
        this.orderRepository = orderRepository;
        this.ticketRepository = ticketRepository;
    }

    /**
     * テストメールを送信（シンプルなテスト）
     * 
     * POST /api/test/email/send
     * Body: { "to": "test@example.com" }
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        
        if (to == null || to.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "送信先メールアドレスが必要です"
            ));
        }

        try {
            // ダミーの注文データを作成してテストメールを送信
            Order dummyOrder = createDummyOrder(to);
            List<Ticket> dummyTickets = createDummyTickets(dummyOrder);
            
            emailService.sendPurchaseConfirmationEmail(dummyOrder, dummyTickets);
            
            logger.info("Test email queued for: {}", to);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "テストメールを送信しました（非同期）",
                "to", to
            ));
        } catch (Exception e) {
            logger.error("Failed to send test email: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 既存の注文に対してメールを再送信
     * 
     * POST /api/test/email/resend/{orderId}
     */
    @PostMapping("/resend/{orderId}")
    public ResponseEntity<Map<String, Object>> resendOrderEmail(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        List<Ticket> tickets = ticketRepository.findByOrder(order);

        try {
            emailService.sendPurchaseConfirmationEmail(order, tickets);
            
            logger.info("Resent email for order {} to {}", orderId, order.getCustomerEmail());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "メールを再送信しました",
                "orderId", orderId,
                "to", order.getCustomerEmail(),
                "ticketCount", tickets.size()
            ));
        } catch (Exception e) {
            logger.error("Failed to resend email for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * メール設定の確認
     * 
     * GET /api/test/email/config
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> checkMailConfig() {
        return ResponseEntity.ok(Map.of(
            "message", "メール設定を確認するには、POST /api/test/email/send でテストメールを送信してください",
            "hint", "application.properties の spring.mail.password が設定されていることを確認してください"
        ));
    }

    // ============================================
    // ヘルパーメソッド
    // ============================================

    private Order createDummyOrder(String email) {
        Order order = new Order();
        order.setId(99999L); // ダミーID
        order.setCustomerName("テスト 太郎");
        order.setCustomerEmail(email);
        order.setCustomerPhone("090-1234-5678");
        order.setPerformanceDate("2025-02-01");
        order.setPerformanceLabel("2025年2月1日（土） 14:00");
        order.setGeneralQuantity(2);
        order.setReservedQuantity(1);
        order.setGeneralPrice(4500);
        order.setReservedPrice(5500);
        order.setDiscountedGeneralCount(1);
        order.setDiscountAmount(4500);
        order.setTotalAmount(10000);
        order.setStatus(Order.OrderStatus.PAID);
        return order;
    }

    private List<Ticket> createDummyTickets(Order order) {
        Ticket ticket1 = new Ticket(order, Ticket.TicketType.GENERAL, true);  // 引換券使用
        Ticket ticket2 = new Ticket(order, Ticket.TicketType.GENERAL, false);
        Ticket ticket3 = new Ticket(order, Ticket.TicketType.RESERVED, false);
        return List.of(ticket1, ticket2, ticket3);
    }
}

