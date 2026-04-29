package com.ashutosh.Splitwise.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@AllArgsConstructor
@Getter
@Setter
public class PersonalExpenseSummaryDto {

    private Long userId;
    private String userName;

    private double totalExpense;

    private String month;

    private Map<String, Double> categoryBreakdown;

    private Map<String, PersonalExpenseResponseDto> highestExpenseByCategory;


}
