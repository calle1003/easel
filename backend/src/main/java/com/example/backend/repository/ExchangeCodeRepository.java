package com.example.backend.repository;

import com.example.backend.entity.ExchangeCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeCodeRepository extends JpaRepository<ExchangeCode, Long> {

    // コードで検索
    Optional<ExchangeCode> findByCode(String code);

    // 未使用のコードで検索
    Optional<ExchangeCode> findByCodeAndIsUsedFalse(String code);

    // 出演者名で検索
    List<ExchangeCode> findByPerformerName(String performerName);

    // 未使用のコード一覧
    List<ExchangeCode> findByIsUsedFalse();

    // 使用済みのコード一覧
    List<ExchangeCode> findByIsUsedTrue();

    // コードが存在するかチェック
    boolean existsByCode(String code);

    // 未使用のコードが存在するかチェック
    boolean existsByCodeAndIsUsedFalse(String code);
}

