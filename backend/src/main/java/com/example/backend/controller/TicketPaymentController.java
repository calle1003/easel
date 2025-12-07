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
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class TicketPaymentController {

  // Price ID (Stripeダッシュボードで設定済み)
  private static final String GENERAL_PRICE_ID = "price_1SbHIbHrC5XXQaL8fYhk5udi";
  private static final String RESERVED_PRICE_ID = "price_1SbHHCHrC5XXQaL81l7vjRAq";

  // 席種ごとの単価（引換券適用分の計算用）
  private static final long GENERAL_PRICE = 4500L;
  private static final long RESERVED_PRICE = 5500L;

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
      // 引換券適用分（無料）と有料分を計算
      int freeGeneralQuantity = request.getDiscountedGeneralCount();
      int chargeableGeneralQuantity = request.getGeneralQuantity() - freeGeneralQuantity;

      SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setSuccessUrl(frontendUrl + "/easel-live/vol2/ticket/success?session_id={CHECKOUT_SESSION_ID}")
          .setCancelUrl(frontendUrl + "/easel-live/vol2/ticket/cancel");

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

      // 合計金額が0円の場合（すべて引換券適用で指定席なし）はエラー
      long totalAmount = (chargeableGeneralQuantity * GENERAL_PRICE)
          + (request.getReservedQuantity() * RESERVED_PRICE);
      if (totalAmount <= 0) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "お支払い金額が0円のため、決済は不要です。");
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
