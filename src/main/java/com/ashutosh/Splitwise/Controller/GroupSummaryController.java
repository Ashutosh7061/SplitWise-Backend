package com.ashutosh.Splitwise.Controller;

import com.ashutosh.Splitwise.Dto.GroupSummaryDto;
import com.ashutosh.Splitwise.Service.GroupSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/groups")
public class GroupSummaryController {
    private  final GroupSummaryService groupSummaryService;

    @GetMapping("{groupId}/summary")
    public GroupSummaryDto getGroupSummary(@PathVariable Long groupId){
        return groupSummaryService.getGroupSummary(groupId);
    }

}
