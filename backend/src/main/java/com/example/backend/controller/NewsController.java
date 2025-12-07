package com.example.backend.controller;

import com.example.backend.entity.News;
import com.example.backend.repository.NewsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NewsController {

    private final NewsRepository newsRepository;

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping
    public List<News> getAllNews() {
        return newsRepository.findAllByOrderByPublishedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable @NonNull Long id) {
        return newsRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<News> createNews(@RequestBody NewsRequest request) {
        News news = new News(
                request.getTitle(),
                request.getContent(),
                request.getPublishedAt() != null ? request.getPublishedAt() : LocalDateTime.now(),
                request.getCategory()
        );
        News saved = newsRepository.save(news);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @RequestBody NewsRequest request) {
        return newsRepository.findById(id)
                .map(news -> {
                    news.setTitle(request.getTitle());
                    news.setContent(request.getContent());
                    news.setCategory(request.getCategory());
                    if (request.getPublishedAt() != null) {
                        news.setPublishedAt(request.getPublishedAt());
                    }
                    News updated = newsRepository.save(news);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        if (newsRepository.existsById(id)) {
            newsRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // リクエストDTO
    public static class NewsRequest {
        private String title;
        private String content;
        private String category;
        private LocalDateTime publishedAt;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public LocalDateTime getPublishedAt() {
            return publishedAt;
        }

        public void setPublishedAt(LocalDateTime publishedAt) {
            this.publishedAt = publishedAt;
        }
    }
}
