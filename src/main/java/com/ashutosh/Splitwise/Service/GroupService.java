package com.ashutosh.Splitwise.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ashutosh.Splitwise.Dto.GroupMemberDto;
import com.ashutosh.Splitwise.Entity.Group;
import com.ashutosh.Splitwise.Entity.GroupInvitation;
import com.ashutosh.Splitwise.Entity.GroupMembership;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Exception.DataNotFoundException;
import com.ashutosh.Splitwise.Exception.DuplicateDataException;
import com.ashutosh.Splitwise.Repository.GroupInvitationRepository;
import com.ashutosh.Splitwise.Repository.GroupMembershipRepository;
import com.ashutosh.Splitwise.Repository.GroupRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;
    private final GroupInvitationRepository groupInvitationRepository;


    public Group createGroup(String name, Long userId){

        userRepository.findById(userId)
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        Optional<Group> existingGroup = groupRepository.findByNameIgnoreCaseAndCreatedBy(name, userId);

        if(existingGroup.isPresent()){
            throw new DuplicateDataException("Group already exist with same name");
        }

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
                .orElseThrow(() -> new DataNotFoundException("Group not found"));

        if (!group.getCreatedBy().equals(adminUserId)) {
            return "Only admin can invite users";
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException("User not registered"));

        // check already member
        Optional<GroupMembership> existingMember =
                groupMembershipRepository.findByGroupIdAndUserIdAndLeftAtIsNull(groupId, user.getId());

        if (existingMember.isPresent()) {
            return "User already in group";
        }

        // check already invited
        Optional<GroupInvitation> existingInvite =
                groupInvitationRepository.findByGroupIdAndInvitedUserId(groupId, user.getId());

        if (existingInvite.isPresent()) {
            return "User already invited";
        }

        // create invitation instead of membership
        GroupInvitation invitation = new GroupInvitation();
        invitation.setGroupId(groupId);
        invitation.setInvitedUserId(user.getId());
        invitation.setInvitedByUserId(adminUserId);
        invitation.setStatus("PENDING");
        invitation.setCreatedAt(LocalDateTime.now());

        groupInvitationRepository.save(invitation);

        return "Invitation sent successfully";
    }

    public String removeUser(Long groupId, Long removeUserId, Long adminUserId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // admin check
        if (!group.getCreatedBy().equals(adminUserId)) {
            return "Only admin can remove users";
        }

        GroupMembership membership = groupMembershipRepository
                .findByGroupIdAndUserIdAndLeftAtIsNull(groupId, removeUserId)
                .orElseThrow(() -> new RuntimeException("User not in group"));

        List<GroupMembership> members = groupMembershipRepository.findByGroupId(groupId);

        List<Long> userIds = members.stream()
                .map(GroupMembership::getUserId)
                .toList();

        Map<Long, Double> balanceMap = expenseService.calculateNetBalanceMap(groupId, userIds);

        double userBalance = balanceMap.getOrDefault(removeUserId, 0.0);

        if (Math.abs(userBalance) > 0.01) {
            StringBuilder message = new StringBuilder();

            if (userBalance < 0) {
                // user owes money
                double amountToPay = Math.abs(userBalance);
                for (Map.Entry<Long, Double> entry : balanceMap.entrySet()) {
                    if (entry.getValue() > 0) { // creditor
                        User creditor = userRepository.findById(entry.getKey()).orElseThrow();
                        double amount = Math.min(amountToPay, entry.getValue());

                        message.append("You need to pay ₹")
                                .append(amount)
                                .append(" to ")
                                .append(creditor.getName())
                                .append(". ");
                        amountToPay -= amount;
                        if (amountToPay <= 0) break;
                    }
                }

            } else {
                // user will receive money
                double amountToReceive = userBalance;
                for (Map.Entry<Long, Double> entry : balanceMap.entrySet()) {
                    if (entry.getValue() < 0) { // debtor
                        User debtor = userRepository.findById(entry.getKey()).orElseThrow();
                        double amount = Math.min(amountToReceive, Math.abs(entry.getValue()));

                        message.append(debtor.getName())
                                .append(" needs to pay you ₹")
                                .append(amount)
                                .append(". ");
                        amountToReceive -= amount;
                        if (amountToReceive <= 0) break;
                    }
                }
            }
            return message.toString();
        }

        membership.setLeftAt(LocalDateTime.now());

        groupMembershipRepository.save(membership);

        return "User removed successfully";
    }

    public List<GroupMemberDto> getGroupMembers(Long groupId) {
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupId(groupId);

        return memberships.stream()
                .map(membership -> {
                    User user = userRepository.findById(membership.getUserId())
                            .orElseThrow(() -> new DataNotFoundException("User not found"));

                    return new GroupMemberDto(
                            membership.getId(),
                            membership.getGroupId(),
                            membership.getUserId(),
                            user.getName(),
                            user.getEmail(),
                            user.getPreferredPaymentMethod(),
                            membership.getJoinedAt(),
                            membership.getLeftAt(),
                            membership.getLeftAt() == null
                    );
                })
                .collect(Collectors.toList());
    }

    public List<GroupInvitation> getPendingInvitations(Long userId) {
        return groupInvitationRepository.findByInvitedUserIdAndStatus(userId, "PENDING");
    }


    public String acceptInvitation(Long invitationId) {

        GroupInvitation invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!"PENDING".equals(invitation.getStatus())) {
            return "Invitation already processed";
        }

        // add to group membership
        GroupMembership membership = new GroupMembership();
        membership.setGroupId(invitation.getGroupId());
        membership.setUserId(invitation.getInvitedUserId());
        membership.setJoinedAt(LocalDateTime.now());

        groupMembershipRepository.save(membership);

        // update invitation
        invitation.setStatus("ACCEPTED");
        groupInvitationRepository.save(invitation);

        return "Joined group successfully";
    }

}
