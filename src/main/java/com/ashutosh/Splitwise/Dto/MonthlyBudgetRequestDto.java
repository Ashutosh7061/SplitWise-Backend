package com.ashutosh.Splitwise.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyBudgetRequestDto {

    private Long userId;
    private double limit;
    private int year;
    private int month;

}
