package com.ashutosh.Splitwise.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class GroupInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    private Long invitedUserId;
    private Long invitedByUserId;

    private String status;

    private LocalDateTime createdAt;
}