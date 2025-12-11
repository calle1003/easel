package com.example.backend.controller;

import com.example.backend.entity.ExchangeCode;
import com.example.backend.entity.Order;
import com.example.backend.repository.ExchangeCodeRepository;
import com.example.backend.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * チケット決済コントローラー
 * 
 * Stripe Checkoutセッションを作成し、チケット購入を処理します。
 */
@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TicketPaymentController {

    private static final Logger logger = LoggerFactory.getLogger(TicketPaymentController.class);

    // ============================================
    // Stripe Price ID (ダッシュボードで設定済み)
    // ============================================
    private static final String GENERAL_PRICE_ID = "price_1SbHIbHrC5XXQaL8fYhk5udi";
    private static final String RESERVED_PRICE_ID = "price_1SbHHCHrC5XXQaL81l7vjRAq";

    // ============================================
    // 席種ごとの単価
    // ============================================
    private static final int GENERAL_PRICE = 4500;
    private static final int RESERVED_PRICE = 5500;

    // ============================================
    // 依存関係
    // ============================================
    private final OrderRepository orderRepository;
    private final ExchangeCodeRepository exchangeCodeRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public TicketPaymentController(
            OrderRepository orderRepository,
            ExchangeCodeRepository exchangeCodeRepository) {
        this.orderRepository = orderRepository;
        this.exchangeCodeRepository = exchangeCodeRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        logger.info("Stripe API initialized");
    }

    // ============================================
    // POST /api/payment/checkout
    // ============================================

    /**
     * Stripe Checkoutセッションを作成
     * 
     * @param request チェックアウトリクエスト
     * @return checkoutUrl と orderId
     */
    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(@RequestBody CheckoutRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // ============================================
            // 1. バリデーション
            // ============================================
            ValidationResult validation = validateRequest(request);
            if (!validation.isValid()) {
                response.put("success", false);
                response.put("error", validation.getError());
                return ResponseEntity.badRequest().body(response);
            }

            // ============================================
            // 2. 引換券コードの検証
            // ============================================
            List<ExchangeCode> validExchangeCodes = new ArrayList<>();
            if (request.getExchangeCodes() != null && !request.getExchangeCodes().isEmpty()) {
                for (String code : request.getExchangeCodes()) {
                    String normalizedCode = code.trim().toUpperCase();
                    Optional<ExchangeCode> exchangeCodeOpt = 
                        exchangeCodeRepository.findByCodeAndIsUsedFalse(normalizedCode);
                    
                    if (exchangeCodeOpt.isEmpty()) {
                        response.put("success", false);
                        response.put("error", "無効または使用済みの引換券コードです: " + code);
                        return ResponseEntity.badRequest().body(response);
                    }
                    validExchangeCodes.add(exchangeCodeOpt.get());
                }

                // 引換券の数と適用数の整合性チェック
                if (validExchangeCodes.size() != request.getDiscountedGeneralCount()) {
                    response.put("success", false);
                    response.put("error", "引換券コードの数と適用枚数が一致しません");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            // ============================================
            // 3. 金額計算
            // ============================================
            int freeGeneralQuantity = request.getDiscountedGeneralCount();
            int chargeableGeneralQuantity = request.getGeneralQuantity() - freeGeneralQuantity;
            int discountAmount = freeGeneralQuantity * GENERAL_PRICE;
            int totalAmount = (chargeableGeneralQuantity * GENERAL_PRICE)
                    + (request.getReservedQuantity() * RESERVED_PRICE);

            // 合計金額が0円の場合はエラー（Stripeは0円決済不可）
            if (totalAmount <= 0) {
                response.put("success", false);
                response.put("error", "お支払い金額が0円のため、決済は不要です。");
                return ResponseEntity.badRequest().body(response);
            }

            // ============================================
            // 4. Stripe Checkout Session作成
            // ============================================
            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/easel-live/vol2/ticket/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/easel-live/vol2/ticket/cancel")
                    .setCustomerEmail(request.getEmail())
                    .setLocale(SessionCreateParams.Locale.JA)  // 日本語UI
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD);

            // メタデータを追加（Webhook処理で使用）
            paramsBuilder.putMetadata("performance_date", request.getDate());
            paramsBuilder.putMetadata("customer_name", request.getName());
            paramsBuilder.putMetadata("general_quantity", String.valueOf(request.getGeneralQuantity()));
            paramsBuilder.putMetadata("reserved_quantity", String.valueOf(request.getReservedQuantity()));
            paramsBuilder.putMetadata("discounted_count", String.valueOf(freeGeneralQuantity));

            // 一般席（引換券適用・無料分）
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
                                                                .setName("easel LIVE vol.2 一般席（引換券適用）")
                                                                .setDescription("引換券による無料チケット")
                                                                .build())
                                                .build())
                                .build());
            }

            // 一般席（有料分）
            if (chargeableGeneralQuantity > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(GENERAL_PRICE_ID)
                                .setQuantity((long) chargeableGeneralQuantity)
                                .build());
            }

            // 指定席
            if (request.getReservedQuantity() > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(RESERVED_PRICE_ID)
                                .setQuantity((long) request.getReservedQuantity())
                                .build());
            }

            Session session = Session.create(paramsBuilder.build());
            logger.info("Stripe session created: {}", session.getId());

            // ============================================
            // 5. 注文をDBに保存（ステータス: PENDING）
            // ============================================
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
            if (!validExchangeCodes.isEmpty()) {
                List<String> codes = validExchangeCodes.stream()
                        .map(ExchangeCode::getCode)
                        .toList();
                order.setExchangeCodeList(codes);
            }

            orderRepository.save(order);
            logger.info("Order created: id={}, sessionId={}", order.getId(), session.getId());

            // ============================================
            // 6. レスポンス
            // ============================================
            response.put("success", true);
            response.put("checkoutUrl", session.getUrl());
            response.put("orderId", order.getId());
            response.put("sessionId", session.getId());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            logger.error("Stripe error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "決済処理中にエラーが発生しました: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", "予期せぬエラーが発生しました");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // ============================================
    // バリデーション
    // ============================================

    private ValidationResult validateRequest(CheckoutRequest request) {
        // 必須項目チェック
        if (request.getDate() == null || request.getDate().isEmpty()) {
            return ValidationResult.invalid("公演日を選択してください");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ValidationResult.invalid("お名前を入力してください");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ValidationResult.invalid("メールアドレスを入力してください");
        }
        if (!isValidEmail(request.getEmail())) {
            return ValidationResult.invalid("有効なメールアドレスを入力してください");
        }

        // 数量チェック
        int totalQuantity = request.getGeneralQuantity() + request.getReservedQuantity();
        if (totalQuantity <= 0) {
            return ValidationResult.invalid("チケットを1枚以上選択してください");
        }
        if (totalQuantity > 10) {
            return ValidationResult.invalid("一度に購入できるチケットは10枚までです");
        }

        // 引換券適用数チェック
        if (request.getDiscountedGeneralCount() < 0) {
            return ValidationResult.invalid("引換券適用枚数が不正です");
        }
        if (request.getDiscountedGeneralCount() > request.getGeneralQuantity()) {
            return ValidationResult.invalid("引換券適用枚数が一般席枚数を超えています");
        }

        return ValidationResult.valid();
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    // ============================================
    // 内部クラス
    // ============================================

    private static class ValidationResult {
        private final boolean valid;
        private final String error;

        private ValidationResult(boolean valid, String error) {
            this.valid = valid;
            this.error = error;
        }

        static ValidationResult valid() {
            return new ValidationResult(true, null);
        }

        static ValidationResult invalid(String error) {
            return new ValidationResult(false, error);
        }

        boolean isValid() {
            return valid;
        }

        String getError() {
            return error;
        }
    }

    // ============================================
    // リクエストDTO
    // ============================================

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

        // Getters and Setters
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
