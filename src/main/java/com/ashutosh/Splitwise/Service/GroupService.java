package com.ashutosh.Splitwise.Service;

import com.ashutosh.Splitwise.Entity.Group;
import com.ashutosh.Splitwise.Entity.GroupMembership;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Exception.DataNotFoundException;
import com.ashutosh.Splitwise.Repository.GroupMembershipRepository;
import com.ashutosh.Splitwise.Repository.GroupRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final UserRepository userRepository;


    public Group createGroup(String name, Long userId){

        User user =userRepository.findById(userId)
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        Group group = new Group();
        group.setName(name);
        group.setCreatedBy(userId);
        group.setStatus("ACTIVE");

        Group savedGroup = groupRepository.save(group);

        GroupMembership membership = new GroupMembership();
        membership.setGroupId(savedGroup.getId());
        membership.setUserId(userId);
        membership.setJoinedAt(LocalDateTime.now());

        groupMembershipRepository.save(membership);

        return savedGroup;
    }

    public String addUserToGroup(Long groupId, String email, Long adminUserId){

        Group group = groupRepository.findById(groupId)
                .orElseThrow(()-> new DataNotFoundException("Group not found"));

        if(!group.getCreatedBy().equals(adminUserId)){
            return "Only admin can add users";
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new DataNotFoundException("User not registered"));

        Optional<GroupMembership> existing = groupMembershipRepository.findByGroupIdAndUserIdAndLeftAtIsNull(groupId,user.getId());

        if(existing.isPresent()){
            return "User already in group";
        }

        GroupMembership membership = new GroupMembership();
        membership.setGroupId(groupId);
        membership.setUserId(user.getId());
        membership.setJoinedAt(LocalDateTime.now());

        groupMembershipRepository.save(membership);

        return "User added successfully";
    }

    public String removeUser(Long groupId, Long removeUserId, Long userId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // admin check
        if (!group.getCreatedBy().equals(userId)) {
            return "Only admin can remove users";
        }

        GroupMembership membership = groupMembershipRepository
                .findByGroupIdAndUserIdAndLeftAtIsNull(groupId, removeUserId)
                .orElseThrow(() -> new RuntimeException("User not in group"));

        // balance check-before removing
        membership.setLeftAt(LocalDateTime.now());

        groupMembershipRepository.save(membership);

        return "User removed successfully";
    }
}
