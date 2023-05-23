package com.system559.blog.model.blog;

import com.fasterxml.jackson.annotation.*;
import com.system559.blog.model.User;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Collection;

@Entity
@Data
@Table(indexes = {
        @Index(name="authorIndex",columnList="user_id")
})
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "commentId", scope = Comment.class)
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="comment_id")
    private Long commentId;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("post")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Setter(AccessLevel.NONE)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment",updatable = false)
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("parentComment")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Setter(AccessLevel.NONE)
    private Comment parentComment;

    @JsonIgnore
    @OneToMany(mappedBy = "parentComment",cascade = CascadeType.ALL)
    private Collection<Comment> childComments;

    public Comment() {
    }

    public Comment(String title, String body, User author, Post post, Comment parentComment) {
        this.createdDateTime = LocalDateTime.now();
        this.lastUpdateDateTime = createdDateTime;
        this.title = title;
        this.body = body;
        this.edited = false;
        this.author = author;
        this.post = post;
        this.parentComment = parentComment;
    }

    public void setCreatedDateTime(LocalDateTime createdDateTime){
        this.createdDateTime=createdDateTime;
        this.lastUpdateDateTime=createdDateTime;
    }

    @JsonProperty("author")
    public void setAuthorById(Long userId) {
        author = User.fromId(userId);
    }

    @JsonProperty("post")
    public void setPostById(Long postId) {
        post = Post.fromId(postId);
    }

    @JsonProperty("parentComment")
    public void setParentCommentById(Long commentId) {
        parentComment = Comment.fromId(commentId);
    }

    public static Comment fromId(Long commentId){
        Comment comment = new Comment();
        comment.commentId=commentId;
        return comment;
    }
}
