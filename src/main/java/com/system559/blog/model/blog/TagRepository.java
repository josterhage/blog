package com.system559.blog.model.blog;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface TagRepository extends CrudRepository<Tag, Long> {
    Optional<Tag> findByName(String name);

    Collection<Tag> findAll();

    Collection<Tag> findTopByNameStartsWith(String expression);

    Tag findFirstByNameStartsWith(String expression);
}
