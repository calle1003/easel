package com.example.backend.controller;

import com.example.backend.entity.Performance;
import com.example.backend.entity.Performance.SaleStatus;
import com.example.backend.repository.PerformanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performances")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PerformanceController {

    private final PerformanceRepository performanceRepository;

    public PerformanceController(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    /**
     * 全公演一覧を取得
     */
    @GetMapping
    public ResponseEntity<List<Performance>> getAllPerformances() {
        List<Performance> performances = performanceRepository.findAll();
        return ResponseEntity.ok(performances);
    }

    /**
     * 公演詳細を取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<Performance> getPerformanceById(@PathVariable @NonNull Long id) {
        return performanceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ボリュームで公演を検索 (vol.1, vol.2 など)
     */
    @GetMapping("/volume/{volume}")
    public ResponseEntity<List<Performance>> getPerformancesByVolume(@PathVariable String volume) {
        List<Performance> performances = performanceRepository.findByVolume(volume);
        return ResponseEntity.ok(performances);
    }

    /**
     * 販売中の公演を取得
     */
    @GetMapping("/on-sale")
    public ResponseEntity<List<Performance>> getOnSalePerformances() {
        List<Performance> performances = performanceRepository
                .findBySaleStatusOrderByPerformanceDateAsc(SaleStatus.ON_SALE);
        return ResponseEntity.ok(performances);
    }

    /**
     * 今後の公演を取得
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<Performance>> getUpcomingPerformances() {
        List<Performance> performances = performanceRepository
                .findByPerformanceDateGreaterThanEqualOrderByPerformanceDateAsc(LocalDate.now());
        return ResponseEntity.ok(performances);
    }

    /**
     * 公演の残席情報を取得
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> getAvailability(@PathVariable @NonNull Long id) {
        return performanceRepository.findById(id)
                .map(performance -> {
                    Map<String, Object> availability = new HashMap<>();
                    availability.put("performanceId", id);
                    availability.put("generalRemaining", performance.getGeneralRemaining());
                    availability.put("reservedRemaining", performance.getReservedRemaining());
                    availability.put("isOnSale", performance.isOnSale());
                    availability.put("isSoldOut", performance.isSoldOut());
                    return ResponseEntity.ok(availability);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 公演を作成（管理者用）
     */
    @PostMapping
    public ResponseEntity<Performance> createPerformance(@RequestBody @NonNull Performance performance) {
        Performance saved = performanceRepository.save(performance);
        return ResponseEntity.ok(saved);
    }

    /**
     * 公演を更新（管理者用）
     */
    @PutMapping("/{id}")
    public ResponseEntity<Performance> updatePerformance(
            @PathVariable @NonNull Long id,
            @RequestBody Performance performanceData) {

        return performanceRepository.findById(id)
                .map(performance -> {
                    performance.setTitle(performanceData.getTitle());
                    performance.setVolume(performanceData.getVolume());
                    performance.setPerformanceDate(performanceData.getPerformanceDate());
                    performance.setPerformanceTime(performanceData.getPerformanceTime());
                    performance.setDoorsOpenTime(performanceData.getDoorsOpenTime());
                    performance.setVenueName(performanceData.getVenueName());
                    performance.setVenueAddress(performanceData.getVenueAddress());
                    performance.setVenueAccess(performanceData.getVenueAccess());
                    performance.setGeneralPrice(performanceData.getGeneralPrice());
                    performance.setReservedPrice(performanceData.getReservedPrice());
                    performance.setGeneralCapacity(performanceData.getGeneralCapacity());
                    performance.setReservedCapacity(performanceData.getReservedCapacity());
                    performance.setSaleStatus(performanceData.getSaleStatus());
                    performance.setSaleStartAt(performanceData.getSaleStartAt());
                    performance.setSaleEndAt(performanceData.getSaleEndAt());
                    performance.setFlyerImageUrl(performanceData.getFlyerImageUrl());
                    performance.setDescription(performanceData.getDescription());

                    Performance updated = performanceRepository.save(performance);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 販売ステータスを更新（管理者用）
     */
    @PutMapping("/{id}/sale-status")
    public ResponseEntity<Map<String, Object>> updateSaleStatus(
            @PathVariable @NonNull Long id,
            @RequestBody SaleStatusRequest request) {

        Map<String, Object> response = new HashMap<>();

        return performanceRepository.findById(id)
                .map(performance -> {
                    try {
                        SaleStatus newStatus = SaleStatus.valueOf(request.getStatus().toUpperCase());
                        performance.setSaleStatus(newStatus);
                        performanceRepository.save(performance);

                        response.put("success", true);
                        response.put("performance", performance);
                        return ResponseEntity.ok(response);
                    } catch (IllegalArgumentException e) {
                        response.put("success", false);
                        response.put("error", "無効なステータスです");
                        return ResponseEntity.badRequest().body(response);
                    }
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("error", "公演が見つかりません");
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * 公演を削除（管理者用）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformance(@PathVariable @NonNull Long id) {
        if (performanceRepository.existsById(id)) {
            performanceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // リクエストDTO
    public static class SaleStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}

