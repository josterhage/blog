package com.system559.blog.controller.blog;

import com.system559.blog.controller.UserNotFoundException;
import com.system559.blog.model.UserRepository;
import com.system559.blog.model.blog.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;

@Controller
@RequestMapping("/blog/post")
public class PostController {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    private final Logger logger = LoggerFactory.getLogger(PostController.class);

    public PostController(PostRepository postRepository, UserRepository userRepository, CategoryRepository categoryRepository, TagRepository tagRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public @ResponseBody
    Collection<Post> getAll() {
        return postRepository.findAll();
    }

    @GetMapping("/allIds")
    public @ResponseBody
    Collection<Long> getAllIds() {
        Collection<Long> ids = new ArrayList<>();
        postRepository.findAll().forEach(post -> {
            ids.add(post.getPostId());
        });
        return ids;
    }

    @GetMapping("/id/{id}")
    public @ResponseBody
    Post getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    @GetMapping("/author/{userId}")
    public @ResponseBody
    Collection<Post> getOneByAuthorId(@PathVariable Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    //the *-to-many relations are not provided by GET /blog/post or /blog/post/id/{id}
    //these mappings provide them

    @GetMapping("/comments/{id}")
    public @ResponseBody
    Collection<Comment> getCommentsById(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        return post.getComments();
    }

    @GetMapping("/tags/{id}")
    public @ResponseBody
    Collection<Tag> getTagsById(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        return post.getTags();
    }

    @GetMapping("/header/{id}")
    public @ResponseBody
    ModelAndView getHeader(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        ModelAndView mav = new ModelAndView("blogMessages :: postHeader");
        mav.addObject("post", post);
        return mav;
    }

    @GetMapping("/headers/newest")
    public @ResponseBody
    ModelAndView getHeaders() {
        Collection<Post> posts = postRepository.findFirst10ByOrderByLastUpdateDateTimeDesc();
        ModelAndView mav = new ModelAndView("blogMessages :: postHeaders");
        mav.addObject("posts", posts);
        return mav;
    }

    @PostMapping("/new")
    public @ResponseBody
    Post newPost(@RequestBody Post newPost) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Collection<Tag> newPostTags = new ArrayList<>();
        System.out.println(newPost);
        newPost.getTags().forEach(tag -> {
            newPostTags.add(tagRepository.findByName(tag.getName())
            .orElseGet(() -> tagRepository.save(tag)));
        });
        Post build = new Post(
                newPost.getTitle().replaceAll("\\<.*?\\>",""),
                newPost.getBody().replaceAll("\\<.*?\\>",""),
                userRepository.findByUsername((String) auth.getPrincipal())
                        .orElseThrow(() -> new UserNotFoundException((String) auth.getPrincipal())),
                categoryRepository.findCategoryByName(newPost.getCategory().getName())
                .orElseThrow(()->new CategoryNotFoundException(newPost.getCategory().getName())),
                newPostTags);
        return postRepository.save(build);
//        return newPost;
    }

    @PutMapping("/edit/{id}")
    public @ResponseBody
    Post editPost(@RequestBody Post updatedPost, @PathVariable Long id) {
        return postRepository.findById(id).map(post -> {
            post.setLastUpdateDateTime(LocalDateTime.now());
            post.setTitle(updatedPost.getTitle().replaceAll("\\<.*?\\>",""));
            post.setBody(updatedPost.getBody().replaceAll("\\<.*?\\>",""));
            post.setEdited(true);
            post.setCategory(updatedPost.getCategory());
            return postRepository.save(post);
        })
                .orElseGet(() -> {
                    updatedPost.setPostId(id);
                    updatedPost.setTitle(updatedPost.getTitle().replaceAll("\\<.*?\\>",""));
                    updatedPost.setBody(updatedPost.getBody().replaceAll("\\<.*?\\>",""));
                    updatedPost.setCreatedDateTime(LocalDateTime.now());
                    updatedPost.setEdited(true);
                    return postRepository.save(updatedPost);
                });
    }

    @PutMapping("/tag/{id}")
    public @ResponseBody
    Post tagPost(@RequestBody Tag tag, @PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        post.addTag(tag);
        return postRepository.save(post);
    }
}
