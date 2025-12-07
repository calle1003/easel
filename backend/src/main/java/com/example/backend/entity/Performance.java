package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "performances")
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 公演情報
    @Column(nullable = false)
    private String title;

    @Column(length = 50)
    private String volume; // vol.1, vol.2 など

    @Column(name = "performance_date", nullable = false)
    private LocalDate performanceDate;

    @Column(name = "performance_time", nullable = false)
    private LocalTime performanceTime;

    @Column(name = "doors_open_time")
    private LocalTime doorsOpenTime;

    // 会場情報
    @Column(name = "venue_name", nullable = false)
    private String venueName;

    @Column(name = "venue_address")
    private String venueAddress;

    @Column(name = "venue_access")
    private String venueAccess;

    // チケット価格
    @Column(name = "general_price", nullable = false)
    private int generalPrice;

    @Column(name = "reserved_price", nullable = false)
    private int reservedPrice;

    // 在庫管理
    @Column(name = "general_capacity")
    private int generalCapacity = 0;

    @Column(name = "reserved_capacity")
    private int reservedCapacity = 0;

    @Column(name = "general_sold")
    private int generalSold = 0;

    @Column(name = "reserved_sold")
    private int reservedSold = 0;

    // 販売状態
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus saleStatus = SaleStatus.NOT_ON_SALE;

    @Column(name = "sale_start_at")
    private LocalDateTime saleStartAt;

    @Column(name = "sale_end_at")
    private LocalDateTime saleEndAt;

    // フライヤー画像
    @Column(name = "flyer_image_url")
    private String flyerImageUrl;

    // 説明
    @Column(columnDefinition = "TEXT")
    private String description;

    // タイムスタンプ
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Performance() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 残席数を計算
    public int getGeneralRemaining() {
        return generalCapacity - generalSold;
    }

    public int getReservedRemaining() {
        return reservedCapacity - reservedSold;
    }

    // 販売中かどうか
    public boolean isOnSale() {
        if (saleStatus != SaleStatus.ON_SALE) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        if (saleStartAt != null && now.isBefore(saleStartAt)) {
            return false;
        }
        if (saleEndAt != null && now.isAfter(saleEndAt)) {
            return false;
        }
        return true;
    }

    // 完売かどうか
    public boolean isSoldOut() {
        return getGeneralRemaining() <= 0 && getReservedRemaining() <= 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public LocalDate getPerformanceDate() {
        return performanceDate;
    }

    public void setPerformanceDate(LocalDate performanceDate) {
        this.performanceDate = performanceDate;
    }

    public LocalTime getPerformanceTime() {
        return performanceTime;
    }

    public void setPerformanceTime(LocalTime performanceTime) {
        this.performanceTime = performanceTime;
    }

    public LocalTime getDoorsOpenTime() {
        return doorsOpenTime;
    }

    public void setDoorsOpenTime(LocalTime doorsOpenTime) {
        this.doorsOpenTime = doorsOpenTime;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getVenueAddress() {
        return venueAddress;
    }

    public void setVenueAddress(String venueAddress) {
        this.venueAddress = venueAddress;
    }

    public String getVenueAccess() {
        return venueAccess;
    }

    public void setVenueAccess(String venueAccess) {
        this.venueAccess = venueAccess;
    }

    public int getGeneralPrice() {
        return generalPrice;
    }

    public void setGeneralPrice(int generalPrice) {
        this.generalPrice = generalPrice;
    }

    public int getReservedPrice() {
        return reservedPrice;
    }

    public void setReservedPrice(int reservedPrice) {
        this.reservedPrice = reservedPrice;
    }

    public int getGeneralCapacity() {
        return generalCapacity;
    }

    public void setGeneralCapacity(int generalCapacity) {
        this.generalCapacity = generalCapacity;
    }

    public int getReservedCapacity() {
        return reservedCapacity;
    }

    public void setReservedCapacity(int reservedCapacity) {
        this.reservedCapacity = reservedCapacity;
    }

    public int getGeneralSold() {
        return generalSold;
    }

    public void setGeneralSold(int generalSold) {
        this.generalSold = generalSold;
    }

    public int getReservedSold() {
        return reservedSold;
    }

    public void setReservedSold(int reservedSold) {
        this.reservedSold = reservedSold;
    }

    public SaleStatus getSaleStatus() {
        return saleStatus;
    }

    public void setSaleStatus(SaleStatus saleStatus) {
        this.saleStatus = saleStatus;
    }

    public LocalDateTime getSaleStartAt() {
        return saleStartAt;
    }

    public void setSaleStartAt(LocalDateTime saleStartAt) {
        this.saleStartAt = saleStartAt;
    }

    public LocalDateTime getSaleEndAt() {
        return saleEndAt;
    }

    public void setSaleEndAt(LocalDateTime saleEndAt) {
        this.saleEndAt = saleEndAt;
    }

    public String getFlyerImageUrl() {
        return flyerImageUrl;
    }

    public void setFlyerImageUrl(String flyerImageUrl) {
        this.flyerImageUrl = flyerImageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 販売ステータス
    public enum SaleStatus {
        NOT_ON_SALE,    // 未販売
        ON_SALE,        // 販売中
        SOLD_OUT,       // 完売
        ENDED           // 販売終了
    }
}

