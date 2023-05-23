package com.system559.blog.controller.blog;

import com.system559.blog.model.blog.Post;
import com.system559.blog.model.blog.Tag;
import com.system559.blog.model.blog.TagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;

@Controller
@RequestMapping("/blog/tag")
public class TagController {
    private final TagRepository tagRepository;

    final Logger logger = LoggerFactory.getLogger(TagController.class);

    public TagController(TagRepository tagRepository){
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public @ResponseBody
    Collection<Tag> all() {
        return tagRepository.findAll();
    }

    @GetMapping("/allIds")
    public @ResponseBody
    Collection<Long> allIds() {
        Collection<Long> ids = new ArrayList<>();
        tagRepository.findAll().forEach(tag -> {
            ids.add(tag.getTagId());
        });
        return ids;
    }

    @GetMapping("/{id}")
    public @ResponseBody
    Tag getTagById(@PathVariable Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new TagNotFoundException(id));
    }

    @GetMapping("/name/{name}")
    public @ResponseBody
    Tag getTagByName(@PathVariable String name) {
        return tagRepository.findByName(name)
                .orElseThrow(() -> new TagNotFoundException(name));
    }

    @GetMapping("/posts/{id}")
    public @ResponseBody
    Collection<Post> getPostsByTag(@PathVariable Long id){
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new TagNotFoundException(id));
        return tag.getPosts();
    }

    @GetMapping("/tagLike/{exp}")
    public @ResponseBody
    Tag getTagStartingWith(@PathVariable String exp){
        return tagRepository.findFirstByNameStartsWith(exp);
    }

    @GetMapping("/tagsLike/{exp}")
    public @ResponseBody
    Collection<Tag> getTagsStartingWith(@PathVariable String exp){
        return tagRepository.findTopByNameStartsWith(exp);
    }

    @PostMapping("/new")
    public @ResponseBody
    Tag newTag(@RequestBody String name){
        return tagRepository.save(new Tag(name.replaceAll("\\<.*?\\>","")));
    }

    @PutMapping("/update/{id}")
    public @ResponseBody
    Tag updateTag(@RequestBody String name, @PathVariable Long id) {
        return tagRepository.findById(id)
                .map(tag -> {
                    tag.setName(name.replaceAll("\\<.*?\\>",""));
                    return tagRepository.save(tag);
                })
                .orElseGet(() -> tagRepository.save(new Tag(name.replaceAll("\\<.*?\\>",""))));
    }
}
