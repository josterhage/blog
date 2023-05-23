/*
 * comment.js
 * Data structures and methods for displaying and actioning comments
 */

/**
 * @class
 * */
function NewCommentManager() {
    this.init = async function () {
        // register click handlers
        $('.reply-click').each(function (index, element) {
            $(element).on('click', replyClick);
        });

        //get the login form
        $commentForm = await Promise.resolve($.ajax({
            url: ajaxHost + '/blog/comment/commentForm',
            type: 'get'
        }).then(function (data) {
                return $(data);
            }
        ));
    }

    let replyClick = function () {
        let $parent;
        if ($(this).data('parent') === 'post') {
            $parent = $('#postReplyBox');
            $parent.append($commentForm);
            $('#parentType').val('post');
            $('#post').val($(this).data('post'));
            $('#parentComment').val('');
        } else {
            $parent = $('.card-body[data-commentid="' + $(this).data('commentid') + '"]');
            $parent.append($commentForm);
            $('#parentType').val('comment');
            $('#parentComment').val($(this).data('commentid'));
            $('#post').val('');
        }

        $('#commentSubmit').on('click', function (e) {
            e.preventDefault();
            submitClick();
        });
    }

    let submitClick = function () {
        let $parentType = $('#parentType');
        let parentType = $parentType.val();
        let $commentTitle = $('#commentTitle');
        let $commentBody = $('#commentBody');
        let $parentComment = $('#parentComment');
        let $post = $('#post');
        comment.commentId = null;
        comment.createdDateTime = null;
        comment.lastUpdateDateTime = null;
        comment.title = $commentTitle.val();
        comment.body = $commentBody.val();
        comment.edited = false;
        comment.parentComment = parentType === 'comment' ? $parentComment.val() : null;
        comment.author = null;
        comment.post = parentType === 'post' ? $post.val() : null;
        comment.childComments = null;

        $.ajax({
            url: ajaxHost + '/blog/comment/new',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(comment),
            beforeSend: function (xhr) {
                xhr.setRequestHeader(getCsrf().header, getCsrf().token);
            },
            success: function (data) {
                $commentForm.remove();
                $.ajax({
                    url: ajaxHost + '/blog/comment/formatted/' + data.commentId,
                    type: 'get',
                    success: function (data) {
                        let $newComment = $('<div class="ml-2 accordion pb-2 pr-2" id="#childCommentsContainer' + data.commentId + '"></div>');
                        let $mb2 = $('<div class="mb-2"></div>');
                        $mb2.append($(data));
                        $newComment.append($mb2);

                        if (comment.parentComment != null) {
                            $('.card[data-commentid="' + comment.parentComment + '"]').append($newComment);
                        } else {
                            $('#commentsSection').append($newComment);
                        }
                        console.log($(data).find('.reply-click'));
                        $newComment.find('.reply-click').each(function (index, element) {
                            $(element).on('click', replyClick);
                        });

                        $newComment.find('.delete-item').each(function (index, element) {
                            $(element).on('click', function () {
                                let item = $(this).data('item');
                                let itemId = $(this).data('id');
                                let url = ajaxHost + '/blog/' + item + '/delete/' + itemId;
                                if (confirm('Are you sure you want to delete this comment? All replies will be deleted as well.')) {
                                    $.ajax({
                                        url: url,
                                        type: 'delete',
                                        beforeSend: function (xhr) {
                                            xhr.setRequestHeader(getCsrf().header, getCsrf().token);
                                        },
                                        success: function () {
                                            let $deletedMessage = $('<div class="text-danger">Deleted</div>');

                                            $('.card[data-commentId="' + itemId + '"]').replaceWith($deletedMessage);
                                            $deletedMessage.fadeOut(2000);
                                        }
                                    })
                                }
                            })
                        })
                    }
                });
            }
        });
        $parentType.val('');
        $commentTitle.val('');
        $commentBody.val('');
        $parentComment.val('');
        $post.val('');
    }

    /**
     * @typedef comment
     * @type {object}
     * @property {number} commentId
     * @property {date} createdDateTime
     * @property {date} lastUpdateDateTime
     * @property {string} title
     * @property {string} body
     * @property {boolean} edited
     * @property {number} author
     * @property {number} post
     * @property {number} parentComment
     * @property {number[]} childComments
     */
    let comment = {};

    let $commentForm;
}