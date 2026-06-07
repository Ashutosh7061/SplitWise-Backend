package com.ashutosh.Splitwise.Dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class GroupSummaryDto {
    private Long groupId;
    private String groupName;
    private double totalExpense;
    private List<UserExpenseSummaryDto> userSummaries;
    private SettlementSummaryDto settlementSummary;

}
