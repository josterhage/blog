package com.system559.blog.model;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface LoginFailureRepository extends CrudRepository<LoginFailure,User> {
    Optional<LoginFailure> findLoginFailureByUser(User user);
}
