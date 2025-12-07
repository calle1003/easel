package com.example.backend.repository;

import com.example.backend.entity.Performance;
import com.example.backend.entity.Performance.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    // ボリュームで検索
    List<Performance> findByVolume(String volume);

    // 販売ステータスで検索
    List<Performance> findBySaleStatus(SaleStatus saleStatus);

    // 販売中の公演を取得
    List<Performance> findBySaleStatusOrderByPerformanceDateAsc(SaleStatus saleStatus);

    // 公演日で検索
    List<Performance> findByPerformanceDate(LocalDate performanceDate);

    // 公演日以降の公演を取得
    List<Performance> findByPerformanceDateGreaterThanEqualOrderByPerformanceDateAsc(LocalDate date);

    // ボリュームと公演日で検索
    Optional<Performance> findByVolumeAndPerformanceDate(String volume, LocalDate performanceDate);

    // タイトルで検索
    List<Performance> findByTitleContaining(String title);
}

