package com.system559.blog.model.blog;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.util.Collection;

@Data
@Entity
public class Category {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Long categoryId;
    private String name;

    public Category() {}

    public Category(String name) {
        System.out.println("Category(String name); name = \"" + name + "\"");
        this.name=name;
    }

    @JsonIgnore
    @OneToMany(mappedBy = "category")
    private Collection<Post> posts;
}
