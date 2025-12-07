package com.example.backend.controller;

import com.example.backend.entity.Order;
import com.example.backend.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TicketPaymentController {

    // Price ID (Stripeダッシュボードで設定済み)
    private static final String GENERAL_PRICE_ID = "price_1SbHIbHrC5XXQaL8fYhk5udi";
    private static final String RESERVED_PRICE_ID = "price_1SbHHCHrC5XXQaL81l7vjRAq";

    // 席種ごとの単価
    private static final int GENERAL_PRICE = 4500;
    private static final int RESERVED_PRICE = 5500;

    private final OrderRepository orderRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public TicketPaymentController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody CheckoutRequest request) {
        try {
            // 引換券適用分（無料）と有料分を計算
            int freeGeneralQuantity = request.getDiscountedGeneralCount();
            int chargeableGeneralQuantity = request.getGeneralQuantity() - freeGeneralQuantity;

            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/easel-live/vol2/ticket/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/easel-live/vol2/ticket/cancel")
                    .setCustomerEmail(request.getEmail());

            // 一般席（引換券適用・無料分）のラインアイテムを追加 - PriceDataで動的生成
            if (freeGeneralQuantity > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity((long) freeGeneralQuantity)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("jpy")
                                                .setUnitAmount(0L)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("easel LIVE vol.2 公演チケット（一般席・引換券適用）")
                                                                .build())
                                                .build())
                                .build());
            }

            // 一般席（有料分）のラインアイテムを追加 - Price IDを使用
            if (chargeableGeneralQuantity > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(GENERAL_PRICE_ID)
                                .setQuantity((long) chargeableGeneralQuantity)
                                .build());
            }

            // 指定席のラインアイテムを追加 - Price IDを使用
            if (request.getReservedQuantity() > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(RESERVED_PRICE_ID)
                                .setQuantity((long) request.getReservedQuantity())
                                .build());
            }

            // 合計金額計算
            int discountAmount = freeGeneralQuantity * GENERAL_PRICE;
            int totalAmount = (chargeableGeneralQuantity * GENERAL_PRICE)
                    + (request.getReservedQuantity() * RESERVED_PRICE);

            // 合計金額が0円の場合はエラー
            if (totalAmount <= 0) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "お支払い金額が0円のため、決済は不要です。");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Session session = Session.create(paramsBuilder.build());

            // 注文をDBに保存（ステータス: PENDING）
            Order order = new Order();
            order.setStripeSessionId(session.getId());
            order.setPerformanceDate(request.getDate());
            order.setPerformanceLabel(request.getDateLabel());
            order.setGeneralQuantity(request.getGeneralQuantity());
            order.setReservedQuantity(request.getReservedQuantity());
            order.setGeneralPrice(GENERAL_PRICE);
            order.setReservedPrice(RESERVED_PRICE);
            order.setDiscountedGeneralCount(freeGeneralQuantity);
            order.setDiscountAmount(discountAmount);
            order.setTotalAmount(totalAmount);
            order.setCustomerName(request.getName());
            order.setCustomerEmail(request.getEmail());
            order.setCustomerPhone(request.getPhone());
            order.setStatus(Order.OrderStatus.PENDING);

            // 引換券コードをカンマ区切りで保存
            if (request.getExchangeCodes() != null && !request.getExchangeCodes().isEmpty()) {
                order.setExchangeCodes(String.join(",", request.getExchangeCodes()));
            }

            orderRepository.save(order);

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", session.getUrl());
            response.put("orderId", order.getId().toString());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // リクエストDTO（拡張版）
    public static class CheckoutRequest {
        private String date;
        private String dateLabel;
        private int generalQuantity;
        private int reservedQuantity;
        private int discountedGeneralCount;
        private List<String> exchangeCodes;
        private String name;
        private String email;
        private String phone;

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getDateLabel() {
            return dateLabel;
        }

        public void setDateLabel(String dateLabel) {
            this.dateLabel = dateLabel;
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

        public int getDiscountedGeneralCount() {
            return discountedGeneralCount;
        }

        public void setDiscountedGeneralCount(int discountedGeneralCount) {
            this.discountedGeneralCount = discountedGeneralCount;
        }

        public List<String> getExchangeCodes() {
            return exchangeCodes;
        }

        public void setExchangeCodes(List<String> exchangeCodes) {
            this.exchangeCodes = exchangeCodes;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }
}
