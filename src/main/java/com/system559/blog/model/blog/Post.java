package com.system559.blog.model.blog;

import com.fasterxml.jackson.annotation.*;
import com.system559.blog.model.User;
import lombok.AccessLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Collection;

@Data
@Entity
@EqualsAndHashCode(callSuper=false)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "postId", scope = Post.class)
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long postId;

    @Setter(AccessLevel.NONE)
    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime createdDateTime;
    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime lastUpdateDateTime;
    private String title;
    private String body;
    private Boolean edited;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("author")
    @Setter(AccessLevel.NONE)
    private User author;

    @JsonIgnore
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "post", cascade=CascadeType.ALL)
    private Collection<Comment> comments;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name="category_id")
    private Category category;

    @ManyToMany
    @JoinTable(name = "post_tag",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonProperty(access= JsonProperty.Access.WRITE_ONLY)
    private Collection<Tag> tags;

    public Post() {
    }

    public Post(String title, String body, User author, Category category, Collection<Tag> tags) {
        this.createdDateTime = LocalDateTime.now();
        this.lastUpdateDateTime = this.createdDateTime;
        this.title = title;
        this.body = body;
        this.edited = false;
        this.author = author;
        this.category = category;
        this.tags = tags;
    }

    public void setCreatedDateTime(LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
        this.lastUpdateDateTime = createdDateTime;
    }

    @JsonProperty("author")
    public void setAuthorById(Long userId) {
        author = User.fromId(userId);
    }

    public void addTag(Tag tag){
        this.tags.add(tag);
    }

    public static Post fromId(Long postId) {
        Post post = new Post();
        post.postId=postId;
        return post;
    }
}
