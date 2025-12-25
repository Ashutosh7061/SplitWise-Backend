package com.ashutosh.Splitwise.Controller;


import com.ashutosh.Splitwise.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/settlements/{groupId}/email")
    public String sendSettlementsEmails(@PathVariable Long groupId){
        return notificationService.sendSettlementEmailToUsers(groupId);
    }
}
