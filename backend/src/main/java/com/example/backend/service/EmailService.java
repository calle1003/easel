package com.example.backend.service;

import com.example.backend.entity.Order;
import com.example.backend.entity.Ticket;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * メール送信サービス
 * 
 * チケット購入完了時などに顧客へメールを送信します。
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name:easel}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ============================================
    // 購入完了メール
    // ============================================

    /**
     * 購入完了メールを送信
     */
    @Async
    public void sendPurchaseConfirmationEmail(Order order, List<Ticket> tickets) {
        if (order == null || order.getCustomerEmail() == null) {
            logger.warn("Cannot send email: order or customer email is null");
            return;
        }
        
        if (fromEmail == null || fromEmail.isEmpty()) {
            logger.warn("Cannot send email: fromEmail is not configured");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String senderName = fromName != null ? fromName : "easel";
            helper.setFrom(fromEmail, senderName);
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("【easel】チケット購入完了のお知らせ");
            helper.setText(buildPurchaseConfirmationHtml(order, tickets), true);

            mailSender.send(message);
            logger.info("Purchase confirmation email sent to: {}", order.getCustomerEmail());

        } catch (MessagingException e) {
            logger.error("Failed to send purchase confirmation email to {}: {}", 
                    order.getCustomerEmail(), e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error sending email to {}: {}", 
                    order.getCustomerEmail(), e.getMessage(), e);
        }
    }

    /**
     * 購入完了メールのHTML本文を生成
     */
    private String buildPurchaseConfirmationHtml(Order order, List<Ticket> tickets) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy年M月d日 HH:mm");
        
        // チケット種別ごとに分類
        List<Ticket> generalTickets = tickets.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.GENERAL)
                .collect(Collectors.toList());
        List<Ticket> reservedTickets = tickets.stream()
                .filter(t -> t.getTicketType() == Ticket.TicketType.RESERVED)
                .collect(Collectors.toList());

        StringBuilder ticketHtml = new StringBuilder();

        if (!generalTickets.isEmpty()) {
            ticketHtml.append(buildTicketSection("一般席（自由席）", generalTickets));
        }
        if (!reservedTickets.isEmpty()) {
            ticketHtml.append(buildTicketSection("指定席", reservedTickets));
        }

        return """
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: #ffffff;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 24px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 24px;
        }
        .info-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }
        .info-section h3 {
            margin: 0 0 12px;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #64748b;
            font-size: 14px;
        }
        .info-value {
            font-weight: 500;
            color: #1e293b;
            font-size: 14px;
        }
        .ticket-section {
            margin-bottom: 20px;
        }
        .ticket-section h3 {
            margin: 0 0 12px;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .ticket-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
        }
        .ticket-code {
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
            font-size: 13px;
            color: #1e293b;
            background: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px dashed #cbd5e1;
            word-break: break-all;
        }
        .ticket-badge {
            display: inline-block;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            margin-bottom: 8px;
        }
        .badge-general {
            background: #dbeafe;
            color: #1d4ed8;
        }
        .badge-reserved {
            background: #f3e8ff;
            color: #7c3aed;
        }
        .badge-exchanged {
            background: #fef3c7;
            color: #b45309;
            margin-left: 4px;
        }
        .total-section {
            background: #1e293b;
            color: #ffffff;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .total-value {
            font-size: 24px;
            font-weight: 600;
        }
        .discount {
            color: #4ade80;
            font-size: 13px;
            text-align: right;
            margin-top: 4px;
        }
        .notice {
            background: #fefce8;
            border: 1px solid #fde047;
            border-radius: 8px;
            padding: 16px;
            margin-top: 20px;
            font-size: 13px;
            color: #854d0e;
        }
        .notice strong {
            display: block;
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            padding: 24px;
            color: #64748b;
            font-size: 12px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>ご購入ありがとうございます</h1>
                <p>チケットの購入が完了しました</p>
            </div>
            
            <div class="content">
                <p class="greeting">
                    %s 様<br><br>
                    この度はチケットをご購入いただき、誠にありがとうございます。<br>
                    下記の内容をご確認ください。
                </p>

                <div class="info-section">
                    <h3>注文情報</h3>
                    <div class="info-row">
                        <span class="info-label">注文番号</span>
                        <span class="info-value">#%d</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">購入日時</span>
                        <span class="info-value">%s</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">公演日</span>
                        <span class="info-value">%s</span>
                    </div>
                </div>

                %s

                <div class="total-section">
                    <div class="total-row">
                        <span class="total-label">お支払い金額</span>
                        <span class="total-value">¥%s</span>
                    </div>
                    %s
                </div>

                <div class="notice">
                    <strong>⚠️ ご注意</strong>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>このメールに記載されたチケットコードは入場時に必要です</li>
                        <li>チケットコードは他の方に共有しないでください</li>
                        <li>当日は本メールをご提示ください</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>
                    ご不明点がございましたら、お問い合わせください。<br>
                    <a href="%s">easel 公式サイト</a>
                </p>
                <p>© easel</p>
            </div>
        </div>
    </div>
</body>
</html>
""".formatted(
                order.getCustomerName(),
                order.getId(),
                order.getCreatedAt().format(dateFormatter),
                order.getPerformanceLabel() != null ? order.getPerformanceLabel() : order.getPerformanceDate(),
                ticketHtml.toString(),
                String.format("%,d", order.getTotalAmount()),
                order.getDiscountAmount() > 0 
                    ? String.format("<div class=\"discount\">（引換券適用: -¥%,d）</div>", order.getDiscountAmount())
                    : "",
                frontendUrl
        );
    }

    /**
     * チケットセクションのHTMLを生成
     */
    private String buildTicketSection(String sectionTitle, List<Ticket> tickets) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"ticket-section\">");
        sb.append("<h3>").append(sectionTitle).append(" (").append(tickets.size()).append("枚)</h3>");
        
        for (Ticket ticket : tickets) {
            String badgeClass = ticket.getTicketType() == Ticket.TicketType.GENERAL 
                    ? "badge-general" : "badge-reserved";
            String badgeText = ticket.getTicketType() == Ticket.TicketType.GENERAL 
                    ? "一般席" : "指定席";
            
            sb.append("<div class=\"ticket-card\">");
            sb.append("<span class=\"ticket-badge ").append(badgeClass).append("\">")
              .append(badgeText).append("</span>");
            
            if (ticket.isExchanged()) {
                sb.append("<span class=\"ticket-badge badge-exchanged\">引換券使用</span>");
            }
            
            sb.append("<div class=\"ticket-code\">").append(ticket.getTicketCode()).append("</div>");
            sb.append("</div>");
        }
        
        sb.append("</div>");
        return sb.toString();
    }
}

