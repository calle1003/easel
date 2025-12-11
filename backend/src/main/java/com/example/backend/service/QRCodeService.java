package com.example.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

/**
 * QRコード生成サービス
 * 
 * チケットコードをQRコードに変換します。
 */
@Service
public class QRCodeService {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeService.class);

    // QRコードのサイズ（ピクセル）
    private static final int DEFAULT_WIDTH = 300;
    private static final int DEFAULT_HEIGHT = 300;

    /**
     * チケットコードからQRコード画像（PNG）をバイト配列で生成
     * 
     * @param ticketCode チケットコード
     * @return PNG画像のバイト配列
     * @throws IOException 画像生成エラー
     * @throws WriterException QRコード生成エラー
     */
    public byte[] generateQRCodeImage(String ticketCode) throws IOException, WriterException {
        return generateQRCodeImage(ticketCode, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * チケットコードからQRコード画像（PNG）をバイト配列で生成（サイズ指定）
     * 
     * @param ticketCode チケットコード
     * @param width 幅（ピクセル）
     * @param height 高さ（ピクセル）
     * @return PNG画像のバイト配列
     * @throws IOException 画像生成エラー
     * @throws WriterException QRコード生成エラー
     */
    public byte[] generateQRCodeImage(String ticketCode, int width, int height) 
            throws IOException, WriterException {
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(ticketCode, BarcodeFormat.QR_CODE, width, height);
        
        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * チケットコードからBase64エンコードされたQRコード画像を生成
     * HTMLのimg srcに直接埋め込める形式
     * 
     * @param ticketCode チケットコード
     * @return Base64エンコードされた画像データ（data:image/png;base64,... 形式）
     */
    public String generateQRCodeBase64(String ticketCode) {
        try {
            byte[] imageBytes = generateQRCodeImage(ticketCode);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            return "data:image/png;base64," + base64Image;
        } catch (Exception e) {
            logger.error("Failed to generate QR code for ticket: {}", ticketCode, e);
            return null;
        }
    }

    /**
     * チケットコードからQRコード画像（小サイズ）を生成
     * メール埋め込み用
     * 
     * @param ticketCode チケットコード
     * @return PNG画像のバイト配列
     */
    public byte[] generateQRCodeImageForEmail(String ticketCode) {
        try {
            return generateQRCodeImage(ticketCode, 200, 200);
        } catch (Exception e) {
            logger.error("Failed to generate QR code for email: {}", ticketCode, e);
            return null;
        }
    }

    /**
     * チケットコードの有効性を検証
     * 
     * @param ticketCode チケットコード
     * @return 有効な場合true
     */
    public boolean isValidTicketCode(String ticketCode) {
        if (ticketCode == null || ticketCode.trim().isEmpty()) {
            return false;
        }
        
        // UUIDフォーマットの簡易チェック
        // 例: 123e4567-e89b-12d3-a456-426614174000
        String uuidPattern = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
        return ticketCode.matches(uuidPattern);
    }
}

