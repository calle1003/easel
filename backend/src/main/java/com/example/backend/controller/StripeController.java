package com.example.backend.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class StripeController {

    // 席種ごとの単価（サーバー側で管理）
    private static final long GENERAL_PRICE = 4500L; // 一般席
    private static final long RESERVED_PRICE = 5500L; // 指定席

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody CheckoutRequest request) {
        try {
            // 実際に課金する枚数を計算（引換券割引分を除く）
            int chargeableGeneralQuantity = request.getGeneralQuantity() - request.getDiscountedGeneralCount();

            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/easel-live/vol2/ticket/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/easel-live/vol2/ticket/cancel");

            // 一般席のラインアイテムを追加（課金対象分のみ）
            if (chargeableGeneralQuantity > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity((long) chargeableGeneralQuantity)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("jpy")
                                                .setUnitAmount(GENERAL_PRICE)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("easel vol.2 公演チケット（一般席）")
                                                                .build())
                                                .build())
                                .build());
            }

            // 指定席のラインアイテムを追加
            if (request.getReservedQuantity() > 0) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity((long) request.getReservedQuantity())
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("jpy")
                                                .setUnitAmount(RESERVED_PRICE)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("easel vol.2 公演チケット（指定席）")
                                                                .build())
                                                .build())
                                .build());
            }

            // ラインアイテムが0の場合はエラー
            if (chargeableGeneralQuantity <= 0 && request.getReservedQuantity() <= 0) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "お支払い金額が0円のため、決済をスキップしました。");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Session session = Session.create(paramsBuilder.build());

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", session.getUrl());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // リクエストDTO
    public static class CheckoutRequest {
        private int generalQuantity;
        private int reservedQuantity;
        private int discountedGeneralCount;

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
    }
}
