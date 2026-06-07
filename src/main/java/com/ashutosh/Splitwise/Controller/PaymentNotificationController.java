package com.ashutosh.Splitwise.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ashutosh.Splitwise.Dto.PaymentNotificationDto;
import com.ashutosh.Splitwise.Service.PaymentNotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment-notifications")
public class PaymentNotificationController {

    private final PaymentNotificationService paymentNotificationService;

    @GetMapping("/receiver/{receiverId}")
    public List<PaymentNotificationDto> getNotificationsForReceiver(@PathVariable Long receiverId) {
        return paymentNotificationService.getNotificationsForReceiver(receiverId);
    }

    @GetMapping("/receiver/{receiverId}/unread")
    public List<PaymentNotificationDto> getUnreadNotifications(@PathVariable Long receiverId) {
        return paymentNotificationService.getUnreadNotificationsForReceiver(receiverId);
    }

    @GetMapping("/{notificationId}")
    public PaymentNotificationDto getNotification(@PathVariable Long notificationId) {
        return paymentNotificationService.getNotificationById(notificationId);
    }

    @PostMapping("/{notificationId}/confirm/{receiverId}")
    public String confirmPayment(@PathVariable Long notificationId, @PathVariable Long receiverId) {
        paymentNotificationService.confirmPaymentNotification(notificationId, receiverId);
        return "Payment confirmed successfully";
    }

    @PostMapping("/settlement/{settlementId}/confirm/{receiverId}")
    public String confirmPaymentBySettlement(@PathVariable Long settlementId, @PathVariable Long receiverId) {
        paymentNotificationService.confirmPaymentNotification(settlementId, receiverId);
        return "Payment confirmed successfully";
    }

    @PutMapping("/{notificationId}/read")
    public PaymentNotificationDto markAsRead(@PathVariable Long notificationId) {
        return paymentNotificationService.markAsRead(notificationId);
    }
}
