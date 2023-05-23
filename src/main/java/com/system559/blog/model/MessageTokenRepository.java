package com.system559.blog.model;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface MessageTokenRepository extends CrudRepository<MessageToken,Long> {
    Optional<MessageToken> findByToken(String token);
}
