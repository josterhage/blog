package com.system559.blog.controller.blog;

import com.system559.blog.controller.UserNotFoundException;
import com.system559.blog.model.ActionStatus;
import com.system559.blog.model.User;
import com.system559.blog.model.UserRepository;
import com.system559.blog.model.blog.Comment;
import com.system559.blog.model.blog.CommentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Optional;

@Controller
@RequestMapping(path = "/blog/comment")
public class CommentController {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    Logger logger = LoggerFactory.getLogger(CommentController.class);

    public CommentController(CommentRepository commentRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/id/{id}")
    public @ResponseBody
    Comment getCommentById(@PathVariable Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException(id));
    }

    @GetMapping("/author/{id}")
    public @ResponseBody
    Collection<Comment> getCommentsByAuthorId(@PathVariable Long id) {
        return commentRepository.findByAuthorId(id);
    }

    @GetMapping("/children/{id}")
    public @ResponseBody
    Collection<Comment> getCommentChildren(@PathVariable Long id) {
        return commentRepository.findCommentsByParentComment(id);
    }

    @GetMapping("/post/{id}")
    public @ResponseBody
    Collection<Comment> getCommentsByPost(@PathVariable Long id) {
        return commentRepository.findByPostId(id);
    }

    @GetMapping("/commentForm")
    public @ResponseBody
    ModelAndView getCommentForm() {
        return new ModelAndView("comment :: commentForm");
    }

    @PostMapping("/new")
    public @ResponseBody
    Comment postNewComment(@RequestBody Comment newComment) {
        //the security filter should prevent anonymous users from reaching this point
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Comment build = new Comment(
                newComment.getTitle().replaceAll("\\<.*?\\>",""),
                newComment.getBody().replaceAll("\\<.*?\\>",""),
                userRepository.findByUsername((String) auth.getPrincipal())
                        .orElseThrow(() -> new UserNotFoundException((String) auth.getPrincipal())),
                newComment.getPost().getPostId() != null
                        ? newComment.getPost() : null,
                newComment.getParentComment() == null
                        || newComment.getParentComment().getCommentId() == null
                        ? null : newComment.getParentComment());
        return commentRepository.save(build);
//        return newComment;
    }

    @PutMapping("/edit/{id}")
    public @ResponseBody
    Comment editComment(@RequestBody Comment updatedComment, @PathVariable Long id) {
        return commentRepository.findById(id).map(comment -> {
            comment.setLastUpdateDateTime(LocalDateTime.now());
            comment.setTitle(updatedComment.getTitle().replaceAll("\\<.*?\\>",""));
            comment.setBody(updatedComment.getBody().replaceAll("\\<.*?\\>",""));
            comment.setEdited(true);
            return commentRepository.save(comment);
        })
                .orElseGet(() -> {
                    updatedComment.setTitle(updatedComment.getTitle().replaceAll("\\<.*?\\>",""));
                    updatedComment.setBody(updatedComment.getBody().replaceAll("\\<.*?\\>",""));
                    updatedComment.setCommentId(id);
                    updatedComment.setCreatedDateTime(LocalDateTime.now());
                    updatedComment.setEdited(true);
                    return commentRepository.save(updatedComment);
                });
    }

    @GetMapping("/formatted/{id}")
    public ModelAndView showComment(@PathVariable Long id) {
        ModelAndView mav = new ModelAndView("comment :: commentView");
        Comment c = commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException(id));
        mav.addObject("comment", c);
        mav.addObject("author", c.getAuthor());
        return mav;
    }

    @DeleteMapping("/delete/{id}")
    public @ResponseBody
    ActionStatus deleteComment(@PathVariable Long id) {
        Optional<Comment> cO = commentRepository.findById(id);
        if (cO.isEmpty()) {
            return new ActionStatus("commentNotFound", false);
        }

        Comment c = cO.get();

        if (!c.getAuthor().getUsername().equals(SecurityContextHolder.getContext().getAuthentication().getPrincipal())) {
            return new ActionStatus("unauthorizedUser", false);
        }

        commentRepository.delete(c);

        return new ActionStatus("commentDeleted", true);
    }
}
