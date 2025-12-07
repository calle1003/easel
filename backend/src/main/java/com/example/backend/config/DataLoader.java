package com.example.backend.config;

import com.example.backend.entity.AdminUser;
import com.example.backend.entity.ExchangeCode;
import com.example.backend.entity.News;
import com.example.backend.entity.Performance;
import com.example.backend.entity.Performance.SaleStatus;
import com.example.backend.repository.AdminUserRepository;
import com.example.backend.repository.ExchangeCodeRepository;
import com.example.backend.repository.NewsRepository;
import com.example.backend.repository.PerformanceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class DataLoader {

        @Bean
        CommandLineRunner initDatabase(NewsRepository newsRepository,
                        ExchangeCodeRepository exchangeCodeRepository,
                        PerformanceRepository performanceRepository,
                        AdminUserRepository adminUserRepository,
                        PasswordEncoder passwordEncoder) {
                return args -> {
                        // 初期管理者ユーザーを作成（既存データがない場合のみ）
                        if (adminUserRepository.count() == 0) {
                                // テスト用管理者アカウント
                                AdminUser admin = new AdminUser(
                                                "admin@easel.jp",
                                                passwordEncoder.encode("admin123"),
                                                "管理者"
                                );
                                adminUserRepository.save(admin);

                                System.out.println("=== 管理者アカウント（テスト用）===");
                                System.out.println("Email: admin@easel.jp");
                                System.out.println("Password: admin123");
                                System.out.println("================================");
                        }

                        // ダミーニュースデータを投入（既存データがない場合のみ）
                        if (newsRepository.count() == 0) {
                                newsRepository.save(new News(
                                                "easel live vol.2 チケット販売開始のお知らせ",
                                                "いつもeaselを応援いただきありがとうございます。\n\n" +
                                                                "このたび、easel live vol.2のチケット販売を開始いたしました。\n\n" +
                                                                "公演日程：2025年○月○日（○）〜○月○日（○）\n" +
                                                                "会場：○○劇場\n" +
                                                                "チケット料金：¥4,000（全席自由・税込）\n\n" +
                                                                "皆様のご来場を心よりお待ちしております。",
                                                LocalDateTime.now().minusDays(1),
                                                "公演情報"));

                                newsRepository.save(new News(
                                                "新メンバー加入のお知らせ",
                                                "easelに新たなメンバーが加わりました。\n\n" +
                                                                "今後の活動にもご期待ください。\n" +
                                                                "詳細はABOUTページをご覧ください。",
                                                LocalDateTime.now().minusDays(7),
                                                "お知らせ"));

                                newsRepository.save(new News(
                                                "公式サイト開設のお知らせ",
                                                "easelの公式サイトを開設いたしました。\n\n" +
                                                                "このサイトでは、公演情報やニュース、グッズ販売など、\n" +
                                                                "easelに関する最新情報をお届けしてまいります。\n\n" +
                                                                "今後とも、easelをよろしくお願いいたします。",
                                                LocalDateTime.now().minusDays(14),
                                                "お知らせ"));
                        }

                        // 引換券コードのダミーデータを投入（既存データがない場合のみ）
                        if (exchangeCodeRepository.count() == 0) {
                                // テスト用の引換券コード
                                exchangeCodeRepository.save(new ExchangeCode("TEST001", "山田太郎"));
                                exchangeCodeRepository.save(new ExchangeCode("TEST002", "山田太郎"));
                                exchangeCodeRepository.save(new ExchangeCode("TEST003", "鈴木花子"));
                                exchangeCodeRepository.save(new ExchangeCode("ABC123", "佐藤一郎"));
                                exchangeCodeRepository.save(new ExchangeCode("XYZ789", "田中美咲"));

                                System.out.println("=== 引換券コード（テスト用）===");
                                System.out.println("TEST001, TEST002 - 山田太郎");
                                System.out.println("TEST003 - 鈴木花子");
                                System.out.println("ABC123 - 佐藤一郎");
                                System.out.println("XYZ789 - 田中美咲");
                                System.out.println("================================");
                        }

                        // 公演情報のダミーデータを投入（既存データがない場合のみ）
                        if (performanceRepository.count() == 0) {
                                // vol.2 公演 - 2025年1月1日 14:00
                                Performance vol2_1 = new Performance();
                                vol2_1.setTitle("easel LIVE vol.2");
                                vol2_1.setVolume("vol.2");
                                vol2_1.setPerformanceDate(LocalDate.of(2025, 1, 1));
                                vol2_1.setPerformanceTime(LocalTime.of(14, 0));
                                vol2_1.setDoorsOpenTime(LocalTime.of(13, 30));
                                vol2_1.setVenueName("○○劇場");
                                vol2_1.setVenueAddress("東京都○○区○○1-2-3");
                                vol2_1.setGeneralPrice(4500);
                                vol2_1.setReservedPrice(5500);
                                vol2_1.setGeneralCapacity(100);
                                vol2_1.setReservedCapacity(30);
                                vol2_1.setSaleStatus(SaleStatus.ON_SALE);
                                vol2_1.setSaleStartAt(LocalDateTime.now().minusDays(7));
                                vol2_1.setDescription("easel LIVE vol.2 新春特別公演");
                                performanceRepository.save(vol2_1);

                                // vol.2 公演 - 2025年1月1日 18:00
                                Performance vol2_2 = new Performance();
                                vol2_2.setTitle("easel LIVE vol.2");
                                vol2_2.setVolume("vol.2");
                                vol2_2.setPerformanceDate(LocalDate.of(2025, 1, 1));
                                vol2_2.setPerformanceTime(LocalTime.of(18, 0));
                                vol2_2.setDoorsOpenTime(LocalTime.of(17, 30));
                                vol2_2.setVenueName("○○劇場");
                                vol2_2.setVenueAddress("東京都○○区○○1-2-3");
                                vol2_2.setGeneralPrice(4500);
                                vol2_2.setReservedPrice(5500);
                                vol2_2.setGeneralCapacity(100);
                                vol2_2.setReservedCapacity(30);
                                vol2_2.setSaleStatus(SaleStatus.ON_SALE);
                                vol2_2.setSaleStartAt(LocalDateTime.now().minusDays(7));
                                vol2_2.setDescription("easel LIVE vol.2 新春特別公演（夜の部）");
                                performanceRepository.save(vol2_2);

                                // vol.2 公演 - 2025年1月2日 14:00
                                Performance vol2_3 = new Performance();
                                vol2_3.setTitle("easel LIVE vol.2");
                                vol2_3.setVolume("vol.2");
                                vol2_3.setPerformanceDate(LocalDate.of(2025, 1, 2));
                                vol2_3.setPerformanceTime(LocalTime.of(14, 0));
                                vol2_3.setDoorsOpenTime(LocalTime.of(13, 30));
                                vol2_3.setVenueName("○○劇場");
                                vol2_3.setVenueAddress("東京都○○区○○1-2-3");
                                vol2_3.setGeneralPrice(4500);
                                vol2_3.setReservedPrice(5500);
                                vol2_3.setGeneralCapacity(100);
                                vol2_3.setReservedCapacity(30);
                                vol2_3.setSaleStatus(SaleStatus.ON_SALE);
                                vol2_3.setSaleStartAt(LocalDateTime.now().minusDays(7));
                                vol2_3.setDescription("easel LIVE vol.2 新春特別公演（千秋楽）");
                                performanceRepository.save(vol2_3);

                                System.out.println("=== 公演情報（テスト用）===");
                                System.out.println("vol.2 - 2025/1/1 14:00 (販売中)");
                                System.out.println("vol.2 - 2025/1/1 18:00 (販売中)");
                                System.out.println("vol.2 - 2025/1/2 14:00 (販売中)");
                                System.out.println("===========================");
                        }
                };
        }
}
