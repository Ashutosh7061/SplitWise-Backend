package com.ashutosh.Splitwise.Service;


import java.time.LocalDateTime;
import java.util.List;

import com.ashutosh.Splitwise.Enum.SettlementStatus;
import org.springframework.stereotype.Service;

import com.ashutosh.Splitwise.Dto.SettlementDto;
import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Enum.PaymentMethod;
import com.ashutosh.Splitwise.Exception.InvalidPaymentMethodException;
import com.ashutosh.Splitwise.Repository.SettlementRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final PaymentNotificationService paymentNotificationService;


    // This method is used to show settlement details to the payer.(also receiver preferred payment method)
    public SettlementDto getSettlementDetails(Long settlementId){

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        User payer = userRepository.findById(settlement.getFromUserId())
                .orElseThrow(()-> new RuntimeException("User not found"));

        User receiver = userRepository.findById(settlement.getToUserId())
                .orElseThrow(()-> new RuntimeException("Receiver not found"));

        return new SettlementDto(
                settlement.getId(),
                payer.getName(),
                receiver.getName(),
                settlement.getAmount(),
                settlement.getStatus(),
                receiver.getPreferredPaymentMethod(),
                settlement.getCreatedAt(),
                settlement.getPaidAt()
        );
    }

    // This method is used to update the status from UNPAID -> PAID and create notification
    public String paySettlement(Long settlementId, PaymentMethod paymentMethod, String transactionId){

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        if (settlement.getStatus() == SettlementStatus.PAID ||
                settlement.getStatus() == SettlementStatus.CONFIRMED) {
            return "Already paid";
        }

        settlement.setStatus(SettlementStatus.PAID);
        settlement.setPaymentMethod(paymentMethod);
        settlement.setTransactionId(transactionId);
        settlement.setPaidAt(LocalDateTime.now());

        settlementRepository.save(settlement);

        // Create notification for receiver
        User payer = userRepository.findById(settlement.getFromUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        paymentNotificationService.createPaymentNotification(
                settlement.getId(),
                settlement.getToUserId(),
                settlement.getFromUserId(),
                payer.getName(),
                settlement.getAmount(),
                transactionId,
                paymentMethod,
                SettlementStatus.PAID
        );

        return "Payment marked as paid. Notification sent to receiver.";
    }

    public String confirmSettlement(Long settlementId, Long receiverId){

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));

        if (!settlement.getToUserId().equals(receiverId)) {
            throw new RuntimeException("Only receiver can confirm");
        }

        if (settlement.getStatus() != SettlementStatus.PAID) {
            throw new RuntimeException("Payment not marked yet");
        }

        settlement.setStatus(SettlementStatus.CONFIRMED);

        settlementRepository.save(settlement);

        // Update notification as confirmed
        paymentNotificationService.confirmPaymentNotification(settlementId, receiverId);

        return "Payment confirmed";
    }

    public List<SettlementDto> getSettlementsForGroup(Long groupId) {
        return settlementRepository.findByGroupId(groupId).stream()
                .map(settlement -> {
                    User payer = userRepository.findById(settlement.getFromUserId())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    User receiver = userRepository.findById(settlement.getToUserId())
                            .orElseThrow(() -> new RuntimeException("Receiver not found"));

                    return new SettlementDto(
                            settlement.getId(),
                            payer.getName(),
                            receiver.getName(),
                            settlement.getAmount(),
                            settlement.getStatus(),
                            receiver.getPreferredPaymentMethod(),
                            settlement.getCreatedAt(),
                            settlement.getPaidAt()
                    );
                })
                .toList();
    }

}
