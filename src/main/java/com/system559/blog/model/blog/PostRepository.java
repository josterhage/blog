package com.system559.blog.model.blog;

import com.system559.blog.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface PostRepository extends CrudRepository<Post,Long> {
    Collection<Post> findAll();

    Collection<Post> findByAuthor(User author);

    @Query("select p from Post p where p.author = :userId")
    Collection<Post> findByAuthorId(Long userId);

    Collection<Post> findByTitleContaining(String pattern);

    Collection<Post> findByBodyContaining(String pattern);

    Post findFirst1ByOrderByLastUpdateDateTimeDesc();

    Collection<Post> findFirst10ByOrderByLastUpdateDateTimeDesc();
}
