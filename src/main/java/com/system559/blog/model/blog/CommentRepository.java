package com.system559.blog.model.blog;

import com.system559.blog.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface CommentRepository extends CrudRepository<Comment, Long> {
    @Query("select c from Comment c where c.author = :authorId")
    Collection<Comment> findByAuthorId(Long authorId);

    @Query("select c from Comment c where c.parentComment = :parentComment")
    Collection<Comment> findCommentsByParentComment(Long parentComment);

    @Query("select c from Comment c where c.post = :postId")
    Collection<Comment> findByPostId(Long postId);
}
