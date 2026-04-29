package com.ashutosh.Splitwise.Service;

import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Exception.DuplicateDataException;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User createUser(User user) {

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            throw new DuplicateDataException("User already exists with this email");
        }
        return userRepository.save(user);
    }
}
