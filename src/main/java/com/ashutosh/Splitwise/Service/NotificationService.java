package com.ashutosh.Splitwise.Service;

import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Repository.SettlementRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public String sendSettlementEmailToUsers(Long groupId){

        List<Settlement> settlements = settlementRepository.findByGroupIdAndStatus(groupId, "UNPAID");

        if(settlements.isEmpty()){
            return "No unpaid settlements found";
        }

        for(Settlement settlement : settlements){

            User payer = userRepository.findById(settlement.getFromUserId()).orElseThrow();

            User receiver = userRepository.findById(settlement.getToUserId()).orElseThrow();

            String subject = "Payment Due : ₹" + settlement.getAmount();

            String body =
                    "Hi " + payer.getName() + ",\n\n" +
                            "You need to pay ₹"+ settlement.getAmount() + " to " +
                            receiver.getName() + ".\n\n" +
                            "Preferred Payment Method: " +
                            receiver.getPreferredPaymentMethod() + "\n\n" +
                            "Please complete the payment and update the status. \n\n" +
                            "Thanks,\nExpense Sharing App";

            emailService.sendMail(
                    payer.getEmail(),
                    subject,
                    body
            );
        }
        return "Email Sent Successfully for unpaid settlements";
    }
}
