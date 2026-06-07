package com.ashutosh.Splitwise.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ashutosh.Splitwise.Dto.PaymentNotificationDto;
import com.ashutosh.Splitwise.Entity.PaymentNotification;
import com.ashutosh.Splitwise.Enum.PaymentMethod;
import com.ashutosh.Splitwise.Enum.SettlementStatus;
import com.ashutosh.Splitwise.Repository.PaymentNotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentNotificationService {

    private final PaymentNotificationRepository paymentNotificationRepository;

    public PaymentNotification createPaymentNotification(
            Long settlementId,
            Long receiverId,
            Long payerId,
            String payerName,
            double amount,
            String transactionId,
            PaymentMethod paymentMethod,
            SettlementStatus status) {

        PaymentNotification notification = new PaymentNotification();
        notification.setSettlementId(settlementId);
        notification.setReceiverId(receiverId);
        notification.setPayerId(payerId);
        notification.setPayerName(payerName);
        notification.setAmount(amount);
        notification.setTransactionId(transactionId);
        notification.setPaymentMethod(paymentMethod);
        notification.setStatus(status);
        notification.setRead(false);

        return paymentNotificationRepository.save(notification);
    }

    public List<PaymentNotificationDto> getNotificationsForReceiver(Long receiverId) {
        return paymentNotificationRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<PaymentNotificationDto> getUnreadNotificationsForReceiver(Long receiverId) {
        return paymentNotificationRepository.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(receiverId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public PaymentNotificationDto getNotificationById(Long notificationId) {
        PaymentNotification notification = paymentNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return mapToDto(notification);
    }

    public PaymentNotificationDto confirmPaymentNotification(Long settlementId, Long receiverId) {
        PaymentNotification notification = paymentNotificationRepository.findBySettlementId(settlementId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getReceiverId().equals(receiverId)) {
            throw new RuntimeException("Only receiver can confirm");
        }

        notification.setStatus(SettlementStatus.CONFIRMED);
        notification.setConfirmedAt(LocalDateTime.now());
        notification.setRead(true);

        paymentNotificationRepository.save(notification);
        return mapToDto(notification);
    }

    public PaymentNotificationDto markAsRead(Long notificationId) {
        PaymentNotification notification = paymentNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        paymentNotificationRepository.save(notification);
        return mapToDto(notification);
    }

    private PaymentNotificationDto mapToDto(PaymentNotification notification) {
        return new PaymentNotificationDto(
                notification.getId(),
                notification.getSettlementId(),
                notification.getReceiverId(),
                notification.getPayerId(),
                notification.getPayerName(),
                notification.getAmount(),
                notification.getTransactionId(),
                notification.getPaymentMethod(),
                notification.getStatus(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getConfirmedAt()
        );
    }
}
