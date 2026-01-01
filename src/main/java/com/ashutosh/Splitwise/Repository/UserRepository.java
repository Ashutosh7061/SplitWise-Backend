package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

//    List<User> findAllByGroupId(Long groupId);

//      List<User> findAllByGroup_Id(Long groupId);

}
