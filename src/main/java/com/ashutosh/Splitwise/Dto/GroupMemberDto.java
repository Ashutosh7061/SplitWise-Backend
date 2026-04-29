package com.ashutosh.Splitwise.Dto;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class GroupMemberDto {
    private Long id;
    private Long groupId;
    private Long userId;
    private String userName;
    private String email;
    private PaymentMethod preferredPaymentMethod;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private boolean active;
}