package com.system559.blog.controller;

import com.system559.blog.controller.blog.CategoryNotFoundException;
import com.system559.blog.controller.blog.PostNotFoundException;
import com.system559.blog.controller.blog.TagNotFoundException;
import com.system559.blog.model.User;
import com.system559.blog.model.UserRepository;
import com.system559.blog.model.blog.CategoryRepository;
import com.system559.blog.model.blog.Post;
import com.system559.blog.model.blog.PostRepository;
import com.system559.blog.model.blog.TagRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/management")
public class ManagementController {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    @Value("${system559.ajax.host}")
    private String ajaxHost;

    public ManagementController(UserRepository userRepository, CategoryRepository categoryRepository,
                                TagRepository tagRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.postRepository = postRepository;
    }

    @GetMapping("/users")
    public ModelAndView management() {
        ModelAndView mav = new ModelAndView("/management/users");
        Iterable<User> users = userRepository.findAll();
        mav.addObject("users", users);
        mav.addObject("ajaxHost", ajaxHost);
        return mav;
    }

    @GetMapping("/blog")
    public ModelAndView blog() {
        ModelAndView mav = new ModelAndView("/management/blog");
        mav.addObject("ajaxHost", ajaxHost);
        return mav;
    }

    @GetMapping("/categoryStub/{id}")
    public ModelAndView categoryStub(@PathVariable Long id) {
        ModelAndView mav = new ModelAndView("/management/management_templates :: categoryStub");
        mav.addObject("category",
                categoryRepository.findById(id)
                        .orElseThrow(() -> new CategoryNotFoundException(id)));
        return mav;
    }

    @GetMapping("/tagStub/{id}")
    public ModelAndView tagStub(@PathVariable Long id) {
        ModelAndView mav = new ModelAndView("/management/management_templates :: tagStub");
        mav.addObject("tag",
                tagRepository.findById(id)
                        .orElseThrow(() -> new TagNotFoundException(id)));
        return mav;
    }

    @GetMapping("/postStub/{id}")
    public ModelAndView postStub(@PathVariable Long id) {
        ModelAndView mav = new ModelAndView("/management/management_templates :: postStub");
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        mav.addObject("post", post);
        mav.addObject("author", post.getAuthor());
        return mav;
    }
}
