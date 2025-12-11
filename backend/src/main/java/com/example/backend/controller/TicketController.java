package com.example.backend.controller;

import com.example.backend.entity.Ticket;
import com.example.backend.repository.TicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * チケット管理・検証API
 * 
 * 入場チェック機能を提供します。
 */
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;

    public TicketController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    /**
     * チケットコードの検証
     * 
     * POST /api/tickets/verify
     * Body: { "ticketCode": "uuid" }
     * 
     * @return チケット情報と有効性
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyTicket(@RequestBody VerifyRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getTicketCode() == null || request.getTicketCode().trim().isEmpty()) {
            response.put("valid", false);
            response.put("error", "チケットコードが指定されていません");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(request.getTicketCode());

        if (ticketOpt.isEmpty()) {
            response.put("valid", false);
            response.put("error", "チケットが見つかりません");
            return ResponseEntity.ok(response);
        }

        Ticket ticket = ticketOpt.get();

        // 使用済みチェック
        if (ticket.isUsed()) {
            response.put("valid", false);
            response.put("error", "このチケットは既に使用済みです");
            response.put("usedAt", ticket.getUsedAt());
            response.put("ticket", buildTicketInfo(ticket));
            return ResponseEntity.ok(response);
        }

        // 有効なチケット
        response.put("valid", true);
        response.put("message", "有効なチケットです");
        response.put("ticket", buildTicketInfo(ticket));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 入場処理（チケットを使用済みにする）
     * 
     * POST /api/tickets/check-in
     * Body: { "ticketCode": "uuid" }
     * 
     * @return 処理結果
     */
    @PostMapping("/check-in")
    public ResponseEntity<Map<String, Object>> checkIn(@RequestBody CheckInRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.getTicketCode() == null || request.getTicketCode().trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "チケットコードが指定されていません");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(request.getTicketCode());

        if (ticketOpt.isEmpty()) {
            response.put("success", false);
            response.put("error", "チケットが見つかりません");
            return ResponseEntity.ok(response);
        }

        Ticket ticket = ticketOpt.get();

        // 既に使用済みチェック
        if (ticket.isUsed()) {
            response.put("success", false);
            response.put("error", "このチケットは既に使用済みです");
            response.put("usedAt", ticket.getUsedAt());
            response.put("ticket", buildTicketInfo(ticket));
            return ResponseEntity.ok(response);
        }

        // 入場処理
        ticket.setUsed(true);
        ticket.setUsedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        response.put("success", true);
        response.put("message", "入場を受け付けました");
        response.put("ticket", buildTicketInfo(ticket));
        response.put("checkedInAt", ticket.getUsedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * 入場統計情報
     * 
     * GET /api/tickets/stats
     * 
     * @return 統計情報
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        List<Ticket> allTickets = ticketRepository.findAll();
        List<Ticket> usedTickets = allTickets.stream()
                .filter(Ticket::isUsed)
                .toList();
        List<Ticket> unusedTickets = allTickets.stream()
                .filter(t -> !t.isUsed())
                .toList();

        // 種別ごとの統計
        long generalTotal = allTickets.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.GENERAL)
                .count();
        long generalUsed = usedTickets.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.GENERAL)
                .count();
        long reservedTotal = allTickets.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.RESERVED)
                .count();
        long reservedUsed = usedTickets.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.RESERVED)
                .count();

        stats.put("totalTickets", allTickets.size());
        stats.put("usedTickets", usedTickets.size());
        stats.put("unusedTickets", unusedTickets.size());
        stats.put("generalTotal", generalTotal);
        stats.put("generalUsed", generalUsed);
        stats.put("reservedTotal", reservedTotal);
        stats.put("reservedUsed", reservedUsed);

        return ResponseEntity.ok(stats);
    }

    /**
     * 本日の入場統計
     * 
     * GET /api/tickets/stats/today
     * 
     * @return 本日の統計情報
     */
    @GetMapping("/stats/today")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();

        List<Ticket> allTickets = ticketRepository.findAll();
        List<Ticket> todayCheckedIn = allTickets.stream()
                .filter(Ticket::isUsed)
                .filter(t -> t.getUsedAt() != null && t.getUsedAt().isAfter(startOfDay))
                .toList();

        long generalCheckedIn = todayCheckedIn.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.GENERAL)
                .count();
        long reservedCheckedIn = todayCheckedIn.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.RESERVED)
                .count();

        stats.put("totalCheckedIn", todayCheckedIn.size());
        stats.put("generalCheckedIn", generalCheckedIn);
        stats.put("reservedCheckedIn", reservedCheckedIn);

        return ResponseEntity.ok(stats);
    }

    // ============================================
    // ヘルパーメソッド
    // ============================================

    private Map<String, Object> buildTicketInfo(Ticket ticket) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", ticket.getId());
        info.put("ticketCode", ticket.getTicketCode());
        info.put("ticketType", ticket.getTicketType().toString());
        info.put("isExchanged", ticket.isExchanged());
        info.put("isUsed", ticket.isUsed());
        info.put("usedAt", ticket.getUsedAt());
        info.put("createdAt", ticket.getCreatedAt());
        
        // 注文情報
        if (ticket.getOrder() != null) {
            Map<String, Object> orderInfo = new HashMap<>();
            orderInfo.put("id", ticket.getOrder().getId());
            orderInfo.put("customerName", ticket.getOrder().getCustomerName());
            orderInfo.put("performanceLabel", ticket.getOrder().getPerformanceLabel());
            orderInfo.put("performanceDate", ticket.getOrder().getPerformanceDate());
            info.put("order", orderInfo);
        }
        
        return info;
    }

    // ============================================
    // リクエストDTO
    // ============================================

    public static class VerifyRequest {
        private String ticketCode;

        public String getTicketCode() {
            return ticketCode;
        }

        public void setTicketCode(String ticketCode) {
            this.ticketCode = ticketCode;
        }
    }

    public static class CheckInRequest {
        private String ticketCode;

        public String getTicketCode() {
            return ticketCode;
        }

        public void setTicketCode(String ticketCode) {
            this.ticketCode = ticketCode;
        }
    }
}

