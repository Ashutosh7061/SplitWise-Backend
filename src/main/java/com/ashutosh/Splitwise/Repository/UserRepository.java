package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

//    List<User> findAllByGroupId(Long groupId);

//      List<User> findAllByGroup_Id(Long groupId);

    Optional<User> findByEmail(String email);

}
