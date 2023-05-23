package com.system559.blog.controller;

import com.system559.blog.model.*;
import com.system559.blog.services.CustomAuthenticationProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping(path = "/user")
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomAuthenticationProvider authProvider;
    Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, CustomAuthenticationProvider authProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authProvider = authProvider;
    }

    @GetMapping(path = "/{id}")
    public @ResponseBody
    User getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @GetMapping
    public @ResponseBody
    User getUser(@RequestParam(value = "username") String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    @GetMapping(path = "/exists")
    public @ResponseBody
    ActionStatus userExists(@RequestParam(value = "username") Optional<String> username, @RequestParam(value = "email") Optional<String> email) {
        return username.map(
                s -> userRepository.findByUsername(s).isPresent()
                        ? ActionStatus.userExists()
                        : ActionStatus.userNotFound())
                .orElseGet(() -> email.map(
                        s -> userRepository.findByEmailIgnoreCase(s).isPresent()
                                ? ActionStatus.userExists()
                                : ActionStatus.userNotFound())
                        .orElseGet(() -> new ActionStatus("invalidRequest", false)));

    }

    @GetMapping("/manyByIds")
    public @ResponseBody
    Iterable<User> getUsersByUserId(@RequestParam(value = "userIds") List<Long> userIds) {
        List<User> users = new ArrayList<>();

        userIds.forEach(userId -> {
            Optional<User> optionalUser = userRepository.findById(userId);
            optionalUser.ifPresent(users::add);
        });

        return users;
    }

    @GetMapping("/count")
    public @ResponseBody
    String getCount() {
        return String.format("%d", userRepository.count());
    }

    @GetMapping("/allIds")
    public @ResponseBody
    Iterable<Long> getAllUserIds() {
        return userRepository.getUserIds();
    }

    @PutMapping("/firstName")
    public @ResponseBody
    User updateFirstName(@RequestParam(value = "id") Long id, @RequestParam(value = "firstName") String value) {
        userRepository.updateFirstName(id, value);
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @PutMapping("/lastName")
    public @ResponseBody
    User updateLastName(@RequestParam(value = "id") Long id, @RequestParam(value = "lastName") String value) {
        userRepository.updateLastName(id, value);
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @PutMapping("/email")
    public @ResponseBody
    ActionStatus updateEmail(@RequestParam(value = "id") Long id, @RequestParam(value = "email") String email) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        user.setEmail(email);

        userRepository.save(user);

        return new ActionStatus("emailUpdated", true);
    }

    @PutMapping("/password")
    public @ResponseBody
    ActionStatus updatePassword(@RequestParam(value = "id") Long id, @RequestParam(value = "oldPassword") String oldPass, @RequestParam(value = "newPassword") String newPass) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(oldPass, user.getPassword())) {
            return new ActionStatus("oldPasswordIncorrect", false);
        }

        if (!CustomAuthenticationProvider.checkPasswordComplexity(newPass)) {
            return ActionStatus.passwordInsecure();
        }

        if (newPass.equals(oldPass)) {
            return new ActionStatus("passwordHistoryFailure",false);
        }

        user.setPassword(passwordEncoder.encode(newPass));

        userRepository.save(user);

        return new ActionStatus("passwordChanged", true);
    }

    @PutMapping("/confirm/{id}")
    public @ResponseBody
    ActionStatus confirmUser(@PathVariable(value = "id") Long id) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        user.setConfirmed(true);

        userRepository.save(user);

        return new ActionStatus("userConfirmed", true);
    }

    // Assumes that the view and model values for User::enabled match
    // TODO: update to make messaging specify whether account was enabled or disabled
    @PutMapping("/enabled/{id}")
    public @ResponseBody
    ActionStatus toggleEnabled(@PathVariable(value = "id") Long id) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        user.setEnabled(!user.isEnabled());

        userRepository.save(user);

        return new ActionStatus("userEnabled", true);
    }

    @PutMapping("/setRole/{id}")
    public @ResponseBody
    ActionStatus setRole(@PathVariable(value = "id") Long id, @RequestParam(value = "newRole") String newRole) {
        Optional<User> optionalUser = userRepository.findById(id);

        if(optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        try {
            user.setUserRole(Role.valueOf(newRole));
        } catch (IllegalArgumentException ex) {
            ex.printStackTrace();
            return new ActionStatus("roleInvalid",false);
        }

        userRepository.save(user);

        return new ActionStatus("roleChanged",true);
    }

    @DeleteMapping("/delete/{id}")
    public @ResponseBody
    ActionStatus deleteUser(@PathVariable Long id) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        userRepository.delete(user);

        return new ActionStatus("userDeleted", true);
    }

    @PutMapping("/update")
    public @ResponseBody
    ActionStatus updateUser(@RequestBody User user){
        if(userRepository.findById(user.getUserId()).isEmpty()) {
            return ActionStatus.userNotFound();
        }

        user.setPassword(userRepository.findById(user.getUserId()).get().getPassword());

        userRepository.save(user);

        return new ActionStatus("userUpdated",true);
    }

    @GetMapping("/check")
    public @ResponseBody
    ActionStatus checkCredentials(@RequestParam(value = "username") String username, @RequestParam(value = "password") String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty()) {
            return new ActionStatus("invalidCredentials", false);
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return new ActionStatus(authProvider.handleLoginFailure(user), false);
        }

        return new ActionStatus("validCredentials", true);
    }
}
