package com.system559.blog.controller.blog;

import com.system559.blog.model.ActionStatus;
import com.system559.blog.model.blog.Category;
import com.system559.blog.model.blog.CategoryRepository;
import com.system559.blog.model.blog.Post;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;

@Controller
@RequestMapping("/blog/category")
public class CategoryController {
    private final CategoryRepository categoryRepository;

    final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public @ResponseBody
    Collection<Category> all() {
        return categoryRepository.findAll();
    }

    @GetMapping("/allIds")
    public @ResponseBody
    Collection<Long> allIds() {
        Collection<Long> ids = new ArrayList<>();
        categoryRepository.findAll().forEach(category -> {
            ids.add(category.getCategoryId());
        });
        return ids;
    }

    @GetMapping("/{id}")
    public @ResponseBody Category getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    @GetMapping("/name/{name}")
    public @ResponseBody Category getCategoryByName(@PathVariable String name) {
        return categoryRepository.findCategoryByName(name)
                .orElseThrow(() -> new CategoryNotFoundException(name));
    }

    @GetMapping("/posts/{id}")
    public @ResponseBody
    Collection<Post> getPostsByCategory(@PathVariable Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        return category.getPosts();
    }

    @PostMapping("/new")
    public @ResponseBody Category newCategory(@RequestBody String name){
        return categoryRepository.save(new Category(name.replaceAll("\\<.*?\\>","")));
    }

    @PutMapping("/update/{id}")
    public @ResponseBody Category updateCategory(@RequestBody String name, @PathVariable Long id){
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(name.replaceAll("\\<.*?\\>",""));
                    return categoryRepository.save(category);
                })
                .orElseGet(() -> categoryRepository.save(new Category(name.replaceAll("\\<.*?\\>",""))));
    }
}
