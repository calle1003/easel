package com.example.backend.controller;

import com.example.backend.entity.Ticket;
import com.example.backend.repository.TicketRepository;
import com.example.backend.service.QRCodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * QRコード生成API
 * 
 * チケットコードからQRコード画像を生成して返します。
 */
@RestController
@RequestMapping("/api/qrcode")
public class QRCodeController {

    private final QRCodeService qrCodeService;
    private final TicketRepository ticketRepository;

    public QRCodeController(QRCodeService qrCodeService, TicketRepository ticketRepository) {
        this.qrCodeService = qrCodeService;
        this.ticketRepository = ticketRepository;
    }

    /**
     * チケットコードからQRコード画像を生成（PNG）
     * 
     * GET /api/qrcode/ticket/{ticketCode}
     * 
     * @param ticketCode チケットコード
     * @return QRコード画像（PNG）
     */
    @GetMapping(value = "/ticket/{ticketCode}", produces = MediaType.IMAGE_PNG_VALUE)
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> getQRCodeByTicketCode(@PathVariable String ticketCode) {
        try {
            // チケットの存在確認
            Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(ticketCode);
            if (ticketOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            byte[] qrCodeImage = qrCodeService.generateQRCodeImage(ticketCode);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCodeImage);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * チケットコードからQRコード画像をBase64形式で取得
     * 
     * GET /api/qrcode/ticket/{ticketCode}/base64
     * 
     * @param ticketCode チケットコード
     * @return JSON { "qrCode": "data:image/png;base64,..." }
     */
    @GetMapping("/ticket/{ticketCode}/base64")
    public ResponseEntity<Map<String, Object>> getQRCodeBase64(@PathVariable String ticketCode) {
        try {
            // チケットの存在確認
            Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(ticketCode);
            if (ticketOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "チケットが見つかりません"
                ));
            }

            Ticket ticket = ticketOpt.get();
            String qrCodeBase64 = qrCodeService.generateQRCodeBase64(ticketCode);

            if (qrCodeBase64 == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "QRコードの生成に失敗しました"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "ticketCode", ticketCode,
                "ticketType", ticket.getTicketType().toString(),
                "isUsed", ticket.isUsed(),
                "qrCode", qrCodeBase64
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "QRコードの生成中にエラーが発生しました"
            ));
        }
    }

    /**
     * 任意のテキストからQRコード画像を生成（テスト用）
     * 
     * GET /api/qrcode/generate?text=hello
     * 
     * @param text エンコードするテキスト
     * @return QRコード画像（PNG）
     */
    @GetMapping(value = "/generate", produces = MediaType.IMAGE_PNG_VALUE)
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> generateQRCode(@RequestParam String text) {
        try {
            byte[] qrCodeImage = qrCodeService.generateQRCodeImage(text);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCodeImage);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

