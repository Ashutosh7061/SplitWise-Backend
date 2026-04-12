package com.ashutosh.Splitwise.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class TimeBasedGroupSummaryDto {

    private Long groupId;
    private String groupName;

    private String analysisType;
    private String fromDate;
    private String toDate;

    private double totalExpense;

    private List<UserExpenseSummaryDto> userSummaries;
}