package com.ashutosh.Splitwise.Controller;

import com.ashutosh.Splitwise.Dto.GroupSummaryDto;
import com.ashutosh.Splitwise.Dto.TimeBasedGroupSummaryDto;
import com.ashutosh.Splitwise.Dto.UserGroupSummaryDto;
import com.ashutosh.Splitwise.Service.GroupSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/groups")
public class GroupSummaryController {
    private  final GroupSummaryService groupSummaryService;

    @GetMapping("{groupId}/summary")
    public GroupSummaryDto getGroupSummary(@PathVariable Long groupId){
        return groupSummaryService.getGroupSummary(groupId);
    }

    @GetMapping("/{groupId}/analysis")
    public TimeBasedGroupSummaryDto getAnalysis(
            @PathVariable Long groupId,
            @RequestParam String type) {

        return groupSummaryService.getGroupSummaryByTime(groupId, type);
    }

    @GetMapping("/{groupId}/summary/user")
    public UserGroupSummaryDto getUserSummary(
            @RequestParam Long groupId,
            @RequestParam String email) {

        return groupSummaryService.getUserGroupSummary(groupId, email);
    }
}
