package com.ashutosh.Splitwise.Service;


import com.ashutosh.Splitwise.Dto.SettlementDto;
import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Enum.PaymentMethod;
import com.ashutosh.Splitwise.Repository.SettlementRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import com.ashutosh.Splitwise.Exception.InvalidPaymentMethodException;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;


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

    // This method is used to update the status from UNPAID -> PAID

    public String paySettlement(Long settlementId, PaymentMethod paymentMethod){

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(()-> new RuntimeException("Settlement not found"));

        User receiver = userRepository.findById(settlement.getToUserId())
                .orElseThrow(()-> new RuntimeException("Receiver not found"));



        if("PAID".equals(settlement.getStatus())){
            return "Settlement already paid";
        }

        if (receiver.getPreferredPaymentMethod() != paymentMethod) {
            throw new InvalidPaymentMethodException(
                    paymentMethod + " is not accepted. Preferred method is "
                            + receiver.getPreferredPaymentMethod()
            );
        }


        settlement.setStatus("PAID");
        settlement.setPaymentMethod(paymentMethod);
        settlement.setPaidAt(LocalDateTime.now());

        settlementRepository.save(settlement);

        return "Payment successful via " + paymentMethod;
    }

}
