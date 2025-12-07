package com.example.backend.controller;

import com.example.backend.entity.AdminUser;
import com.example.backend.repository.AdminUserRepository;
import com.example.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AdminUserRepository adminUserRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * ログイン
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        // メールアドレスでユーザーを検索
        var adminUserOpt = adminUserRepository.findByEmail(request.getEmail());

        if (adminUserOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "メールアドレスまたはパスワードが正しくありません");
            return ResponseEntity.status(401).body(response);
        }

        AdminUser adminUser = adminUserOpt.get();

        // パスワードを検証
        if (!passwordEncoder.matches(request.getPassword(), adminUser.getPassword())) {
            response.put("success", false);
            response.put("error", "メールアドレスまたはパスワードが正しくありません");
            return ResponseEntity.status(401).body(response);
        }

        // 最終ログイン日時を更新
        adminUser.setLastLoginAt(LocalDateTime.now());
        adminUserRepository.save(adminUser);

        // JWTトークンを生成
        String token = jwtUtil.generateToken(adminUser.getEmail(), adminUser.getName(), adminUser.getId());

        response.put("success", true);
        response.put("token", token);
        response.put("user", Map.of(
                "id", adminUser.getId(),
                "email", adminUser.getEmail(),
                "name", adminUser.getName(),
                "role", adminUser.getRole().name()
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * 現在のユーザー情報を取得
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        String email = jwtUtil.getEmailFromToken(token);
        var adminUserOpt = adminUserRepository.findByEmail(email);

        if (adminUserOpt.isEmpty()) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        AdminUser adminUser = adminUserOpt.get();

        response.put("authenticated", true);
        response.put("user", Map.of(
                "id", adminUser.getId(),
                "email", adminUser.getEmail(),
                "name", adminUser.getName(),
                "role", adminUser.getRole().name()
        ));

        return ResponseEntity.ok(response);
    }

    // リクエストDTO
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}


