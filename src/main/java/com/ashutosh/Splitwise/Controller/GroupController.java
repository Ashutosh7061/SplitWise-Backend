package com.ashutosh.Splitwise.Controller;

import com.ashutosh.Splitwise.Entity.Group;
import com.ashutosh.Splitwise.Repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupRepository groupRepository;

    @PostMapping
    public Group createGroup(@RequestBody Group group){
        return groupRepository.save(group);
    }

    @GetMapping
    public List<Group> getGroups(){
        return groupRepository.findAll();
    }
}
