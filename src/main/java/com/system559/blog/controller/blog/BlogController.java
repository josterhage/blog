package com.system559.blog.controller.blog;

import com.system559.blog.model.User;
import com.system559.blog.model.UserRepository;
import com.system559.blog.model.blog.Post;
import com.system559.blog.model.blog.PostRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/blog")
public class BlogController {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public BlogController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ModelAndView showBlog(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ModelAndView modelAndView = new ModelAndView("blogMessages :: blogPost");
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        modelAndView.addObject("owner", isOwner(post.getAuthor()));
        modelAndView.addObject("post", post);
        modelAndView.addObject("author", post.getAuthor());

        return modelAndView;
    }

    @GetMapping("/newest")
    public ModelAndView newestBlog() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ModelAndView modelAndView = new ModelAndView("blogMessages :: blogPost");
        Post post = postRepository.findFirst1ByOrderByLastUpdateDateTimeDesc();
        modelAndView.addObject("owner",isOwner(post.getAuthor()));
        modelAndView.addObject("post", post);
        modelAndView.addObject("author", post.getAuthor());

        return modelAndView;
    }

    @GetMapping("/createPost")
    public @ResponseBody
    ModelAndView newBlogPost() {
        return new ModelAndView("blog/createPost");
    }

    private boolean isOwner(User author) {
        var ref = new Object() {
            boolean owner;
        };
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        userRepository.findByUsername((String)auth.getPrincipal())
                .ifPresent(authenticatedUser -> {
                    ref.owner = authenticatedUser.equals(author);
                });
        return ref.owner;
    }
}
