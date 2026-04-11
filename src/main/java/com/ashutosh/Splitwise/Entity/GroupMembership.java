package com.ashutosh.Splitwise.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
public class GroupMembership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;
    private Long userId;


    private LocalDateTime joinedAt;
    @Column(nullable = true)
    private LocalDateTime leftAt;
}
