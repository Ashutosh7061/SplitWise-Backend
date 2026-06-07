package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.GroupInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    List<GroupInvitation> findByInvitedUserIdAndStatus(Long userId, String status);

    Optional<GroupInvitation> findByGroupIdAndInvitedUserId(Long groupId, Long userId);
}