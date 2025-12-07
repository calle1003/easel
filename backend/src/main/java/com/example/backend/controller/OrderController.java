package com.example.backend.controller;

import com.example.backend.entity.Order;
import com.example.backend.entity.Order.OrderStatus;
import com.example.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * 全注文一覧を取得
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    /**
     * 注文詳細を取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Stripe Session IDで注文を検索
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Order> getOrderBySessionId(@PathVariable String sessionId) {
        return orderRepository.findByStripeSessionId(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ステータスで注文を検索
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderRepository.findByStatus(orderStatus);
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 公演日で注文を検索
     */
    @GetMapping("/performance/{date}")
    public ResponseEntity<List<Order>> getOrdersByPerformanceDate(@PathVariable String date) {
        List<Order> orders = orderRepository.findByPerformanceDate(date);
        return ResponseEntity.ok(orders);
    }

    /**
     * 注文ステータスを更新
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        Map<String, Object> response = new HashMap<>();

        return orderRepository.findById(id)
                .map(order -> {
                    try {
                        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());

                        switch (newStatus) {
                            case PAID:
                                order.markAsPaid(request.getPaymentIntentId());
                                break;
                            case CANCELLED:
                                order.markAsCancelled();
                                break;
                            case REFUNDED:
                                order.markAsRefunded();
                                break;
                            default:
                                order.setStatus(newStatus);
                        }

                        orderRepository.save(order);

                        response.put("success", true);
                        response.put("order", order);
                        return ResponseEntity.ok(response);

                    } catch (IllegalArgumentException e) {
                        response.put("success", false);
                        response.put("error", "無効なステータスです");
                        return ResponseEntity.badRequest().body(response);
                    }
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("error", "注文が見つかりません");
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * 支払い完了した注文の統計情報
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        Map<String, Object> stats = new HashMap<>();

        List<Order> paidOrders = orderRepository.findByStatus(OrderStatus.PAID);

        int totalOrders = paidOrders.size();
        int totalRevenue = paidOrders.stream().mapToInt(Order::getTotalAmount).sum();
        int totalTickets = paidOrders.stream()
                .mapToInt(o -> o.getGeneralQuantity() + o.getReservedQuantity())
                .sum();
        int totalGeneralTickets = paidOrders.stream().mapToInt(Order::getGeneralQuantity).sum();
        int totalReservedTickets = paidOrders.stream().mapToInt(Order::getReservedQuantity).sum();
        int totalDiscountedTickets = paidOrders.stream().mapToInt(Order::getDiscountedGeneralCount).sum();

        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalTickets", totalTickets);
        stats.put("totalGeneralTickets", totalGeneralTickets);
        stats.put("totalReservedTickets", totalReservedTickets);
        stats.put("totalDiscountedTickets", totalDiscountedTickets);

        return ResponseEntity.ok(stats);
    }

    // リクエストDTO
    public static class StatusUpdateRequest {
        private String status;
        private String paymentIntentId;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPaymentIntentId() {
            return paymentIntentId;
        }

        public void setPaymentIntentId(String paymentIntentId) {
            this.paymentIntentId = paymentIntentId;
        }
    }
}

