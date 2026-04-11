package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.GroupMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMembershipRepository extends JpaRepository<GroupMembership,Long> {
    List<GroupMembership> findByGroupId(Long groupId);

    Optional<GroupMembership> findByGroupIdAndUserIdAndLeftAtIsNull(Long groupId, Long userId);

}
