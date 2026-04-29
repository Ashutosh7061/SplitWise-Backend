package com.ashutosh.Splitwise.Dto;

import lombok.Getter;

@Getter
public class PersonalExpenseRequestDto {

    private Long userId;
    private String description;
    private double amount;
    private String category;
}
