package com.ashutosh.Splitwise.Controller;

import com.ashutosh.Splitwise.Dto.GroupMemberDto;
import com.ashutosh.Splitwise.Entity.Group;
import com.ashutosh.Splitwise.Repository.GroupRepository;
import com.ashutosh.Splitwise.Service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupRepository groupRepository;
    private final GroupService groupService;

    @PostMapping("/create")
    public Group createGroup(@RequestBody Map<String, Object> request){

        String name = (String) request.get("name");
        Long userId = Long.valueOf(request.get("userId").toString());

        return groupService.createGroup(name, userId);
    }

    @GetMapping
    public List<Group> getGroups(){
        return groupRepository.findAll();
    }

    @PostMapping("/add-user")
    public String addUser(@RequestBody Map<String, Object> request){

        Long groupId = Long.valueOf(request.get("groupId").toString());
        String email = (String) request.get("email");
        Long userId = Long.valueOf(request.get("userId").toString());

        return groupService.addUserToGroup(groupId,email,userId);
    }

    @PostMapping("/remove-user")
    public String removeUser(@RequestBody Map<String, Object> request) {

        Long groupId = Long.valueOf(request.get("groupId"). toString());
        Long removeUserId = Long.valueOf(request.get("removeUserId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());

        return groupService.removeUser(groupId, removeUserId, userId);
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMemberDto> getGroupMembers(@PathVariable Long groupId) {
        return groupService.getGroupMembers(groupId);
    }
}
