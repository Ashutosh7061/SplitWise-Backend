package com.ashutosh.Splitwise.Controller;


import com.ashutosh.Splitwise.Exception.UserNotFoundException;
import com.ashutosh.Splitwise.Repository.UserRepository;
import com.ashutosh.Splitwise.Service.UserService;
import lombok.RequiredArgsConstructor;
import com.ashutosh.Splitwise.Entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @PostMapping
    public User createUser(@RequestBody User user){
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getUsers(){
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUserWithId(@PathVariable Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with specific id "+ id));
        return user;
    }

}
