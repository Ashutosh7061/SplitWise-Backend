package com.ashutosh.Splitwise.Dto;

import com.ashutosh.Splitwise.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
public class GroupSummaryDto {
    private Long groupId;
    private String groupName;
    private double totalExpense;
    private List<UserExpenseSummaryDto> userSummaries;
    private SettlementSummaryDto settlementSummary;

}
