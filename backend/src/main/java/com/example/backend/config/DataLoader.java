package com.example.backend.config;

import com.example.backend.entity.News;
import com.example.backend.repository.NewsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataLoader {

        @Bean
        CommandLineRunner initDatabase(NewsRepository newsRepository) {
                return args -> {
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
                };
        }
}
