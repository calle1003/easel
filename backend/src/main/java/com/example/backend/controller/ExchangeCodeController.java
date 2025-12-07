package com.example.backend.controller;

import com.example.backend.entity.ExchangeCode;
import com.example.backend.repository.ExchangeCodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/exchange-codes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ExchangeCodeController {

    private final ExchangeCodeRepository exchangeCodeRepository;

    public ExchangeCodeController(ExchangeCodeRepository exchangeCodeRepository) {
        this.exchangeCodeRepository = exchangeCodeRepository;
    }

    /**
     * 全引換券コード一覧を取得
     * GET /api/exchange-codes
     */
    @GetMapping
    public ResponseEntity<List<ExchangeCode>> getAllCodes() {
        List<ExchangeCode> codes = exchangeCodeRepository.findAll();
        // 未使用を先に、その後作成日時順
        codes.sort((a, b) -> {
            if (a.isUsed() != b.isUsed()) {
                return a.isUsed() ? 1 : -1;
            }
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(codes);
    }

    /**
     * 引換券コードを作成
     * POST /api/exchange-codes
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCode(@RequestBody CreateRequest request) {
        Map<String, Object> response = new HashMap<>();

        String code = request.getCode().trim().toUpperCase();

        // 重複チェック
        if (exchangeCodeRepository.existsByCode(code)) {
            response.put("success", false);
            response.put("error", "このコードは既に存在します");
            return ResponseEntity.badRequest().body(response);
        }

        ExchangeCode exchangeCode = new ExchangeCode(code, request.getPerformerName());
        ExchangeCode saved = exchangeCodeRepository.save(exchangeCode);

        response.put("success", true);
        response.put("code", saved);
        return ResponseEntity.ok(response);
    }

    /**
     * 引換券コードを一括生成
     * POST /api/exchange-codes/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> createBatch(@RequestBody BatchRequest request) {
        Map<String, Object> response = new HashMap<>();

        int count = Math.min(request.getCount(), 50); // 最大50件
        List<ExchangeCode> createdCodes = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            String code = generateUniqueCode();
            ExchangeCode exchangeCode = new ExchangeCode(code, request.getPerformerName());
            createdCodes.add(exchangeCodeRepository.save(exchangeCode));
        }

        response.put("success", true);
        response.put("count", createdCodes.size());
        response.put("codes", createdCodes);
        return ResponseEntity.ok(response);
    }

    /**
     * ユニークなコードを生成
     */
    private String generateUniqueCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 紛らわしい文字を除外
        Random random = new Random();
        String code;

        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (exchangeCodeRepository.existsByCode(code));

        return code;
    }

    /**
     * 引換券コードのバリデーション
     * POST /api/exchange-codes/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCode(@RequestBody ValidateRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            response.put("valid", false);
            response.put("message", "コードを入力してください");
            return ResponseEntity.badRequest().body(response);
        }

        String code = request.getCode().trim().toUpperCase();

        // コードが存在するかチェック
        var exchangeCode = exchangeCodeRepository.findByCode(code);

        if (exchangeCode.isEmpty()) {
            response.put("valid", false);
            response.put("message", "無効なコードです");
            return ResponseEntity.ok(response);
        }

        // 使用済みかチェック
        if (exchangeCode.get().isUsed()) {
            response.put("valid", false);
            response.put("message", "このコードは既に使用されています");
            return ResponseEntity.ok(response);
        }

        // 有効なコード
        response.put("valid", true);
        response.put("message", "有効なコードです");
        response.put("performerName", exchangeCode.get().getPerformerName());
        return ResponseEntity.ok(response);
    }

    /**
     * 複数の引換券コードを一括バリデーション
     * POST /api/exchange-codes/validate-batch
     */
    @PostMapping("/validate-batch")
    public ResponseEntity<Map<String, Object>> validateCodes(@RequestBody ValidateBatchRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getCodes() == null || request.getCodes().isEmpty()) {
            response.put("validCount", 0);
            response.put("results", List.of());
            return ResponseEntity.ok(response);
        }

        List<Map<String, Object>> results = request.getCodes().stream()
                .map(code -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("code", code);

                    if (code == null || code.trim().isEmpty()) {
                        result.put("valid", false);
                        result.put("message", "空のコードです");
                        return result;
                    }

                    String normalizedCode = code.trim().toUpperCase();
                    var exchangeCode = exchangeCodeRepository.findByCode(normalizedCode);

                    if (exchangeCode.isEmpty()) {
                        result.put("valid", false);
                        result.put("message", "無効なコードです");
                    } else if (exchangeCode.get().isUsed()) {
                        result.put("valid", false);
                        result.put("message", "使用済みのコードです");
                    } else {
                        result.put("valid", true);
                        result.put("message", "有効");
                        result.put("performerName", exchangeCode.get().getPerformerName());
                    }

                    return result;
                })
                .toList();

        long validCount = results.stream()
                .filter(r -> Boolean.TRUE.equals(r.get("valid")))
                .count();

        response.put("validCount", validCount);
        response.put("results", results);
        return ResponseEntity.ok(response);
    }

    // リクエストDTO
    public static class CreateRequest {
        private String code;
        private String performerName;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getPerformerName() {
            return performerName;
        }

        public void setPerformerName(String performerName) {
            this.performerName = performerName;
        }
    }

    public static class BatchRequest {
        private String performerName;
        private int count;

        public String getPerformerName() {
            return performerName;
        }

        public void setPerformerName(String performerName) {
            this.performerName = performerName;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }

    public static class ValidateRequest {
        private String code;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }
    }

    public static class ValidateBatchRequest {
        private List<String> codes;

        public List<String> getCodes() {
            return codes;
        }

        public void setCodes(List<String> codes) {
            this.codes = codes;
        }
    }
}
