package com.system559.blog.services;

import com.system559.blog.controller.UserController;
import com.system559.blog.model.LoginFailure;
import com.system559.blog.model.LoginFailureRepository;
import com.system559.blog.model.User;
import com.system559.blog.model.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;
import java.util.regex.Pattern;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {
    private final LoginFailureRepository failureRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder = passwordEncoder();
    static Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$";

    @Autowired
    public CustomAuthenticationProvider(LoginFailureRepository failureRepository, UserRepository userRepository) {
        this.failureRepository = failureRepository;
        this.userRepository = userRepository;
    }


    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty()) {
            throw new UsernameNotFoundException("Username not found: " + username);
        }

        User user = optionalUser.get();

        if (encoder.matches(password, user.getPassword())) {
            Optional<LoginFailure> loginFailure = failureRepository.findLoginFailureByUser(user);
            loginFailure.ifPresent(failureRepository::delete);
            Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getUserRole().toString()));
            return new UsernamePasswordAuthenticationToken(username, password, authorities);
        } else {
            String failureMessage = handleLoginFailure(user);

            if(failureMessage.equals("accountLocked")) {
                throw new LockedException("User " + username + " is locked.");
            } else if (failureMessage.equals("invalidCredentials")) {
                throw new BadCredentialsException("Invalid credentials provided");
            } else {
                throw new AuthenticationCredentialsNotFoundException("Error");
            }
        }
    }

    public Authentication authenticate(User user) {
        Collection<GrantedAuthority> roles = new ArrayList<>();

        roles.add(new SimpleGrantedAuthority("ROLE_" + user.getUserRole()));

        return new UsernamePasswordAuthenticationToken(user.getUsername(),user.getPassword(),roles);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }

    public String handleLoginFailure(User user) {
        LoginFailure failure;
        int failureCount;
        Optional<LoginFailure> optionalLoginFailure = failureRepository.findLoginFailureByUser(user);

        if(optionalLoginFailure.isEmpty()) {
            failure = new LoginFailure(user);
            failure.setLastFailure(0L);
        } else {
            failure = optionalLoginFailure.get();
        }

        if(System.currentTimeMillis() - failure.getLastFailure() > 900000) {
            failureCount = 1;
        } else {
            failureCount = failure.getFailureCount() + 1;
        }

        failure.setLastFailure(System.currentTimeMillis());
        failure.setFailureCount(failureCount);
        failureRepository.save(failure);

        if(failureCount > 2) {
            user.setEnabled(false);
            userRepository.save(user);
            return "accountLocked";
        }
        return "invalidCredentials";
    }

    public static boolean checkPasswordComplexity(String password) {
        return Pattern.matches(passwordRegex,password);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
