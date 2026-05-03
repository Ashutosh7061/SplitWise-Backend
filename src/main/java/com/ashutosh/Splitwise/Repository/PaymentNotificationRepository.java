package com.ashutosh.Splitwise.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ashutosh.Splitwise.Entity.PaymentNotification;

@Repository
public interface PaymentNotificationRepository extends JpaRepository<PaymentNotification, Long> {

    List<PaymentNotification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    Optional<PaymentNotification> findBySettlementId(Long settlementId);

    List<PaymentNotification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId);
}
