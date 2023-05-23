/*
 * BlogManagementPage.js
 *
 * Collection of properties and methods for dynamic rendering of the
 * whole site blog management page
 */

/**
 * @class
 */
function BlogManagementPage() {
    let submitHandler = function (e) {
        let type=e.data.type;
        $.ajax({
            url: tags[type].path,
            type:'post',
            data: tags[type].text.val(),
            contentType: 'text/plain',
            beforeSend: function(xhr) {
                xhr.setRequestHeader(getCsrf().header,getCsrf().token);
            },
            success: function(data) {
                let newStub = new CategoryTagStub(data[`${type}Id`],type);
                newStub.init().then(function () {tags[type].table.append(newStub.stub())});
                tags[type].text.val('');
            }
        })
    }

    let resetHandler = function(e) {
        tags[e.data.type].text.val('');
    }

    let newPath = function (type) {
        return `${ajaxHost}/blog/${type}/new`;
    }

    const categoryIdsPath = `${ajaxHost}/blog/category/allIds`;
    const tagIdsPath = `${ajaxHost}/blog/tag/allIds`;
    const postIdsPath = `${ajaxHost}/blog/post/allIds`;
    const newCategoryPath = `${ajaxHost}/blog/category/new`;
    const newTagPath = `${ajaxHost}/blog/tag/new`;

    let $categoryTable = $('#categoryTable');
    let $tagTable = $('#tagTable');
    let $postTable = $('#postTable');

    let tags = {
        category: {
            text: $('#newCategoryText'),
            submit: $('#newCategorySubmit'),
            reset: $('#newCategoryReset'),
            table: $categoryTable,
            path:newCategoryPath
        },
        tag: {
            text: $('#newTagText'),
            submit: $('#newTagSubmit'),
            reset:$('#newTagReset'),
            table:$tagTable,
            path:newTagPath
        }
    };

    tags.category.submit.on('click',{type:"category"},submitHandler);
    tags.category.reset.on('click',{type:"category"},resetHandler);
    tags.tag.submit.on('click',{type:"tag"},submitHandler);
    tags.tag.reset.on('click',{type:"tag"},resetHandler);

    $.ajax({
        url: categoryIdsPath,
        type: 'get',
        success: function (data) {
            data.forEach(function (index) {
                let catStub = new CategoryTagStub(index, 'category');
                catStub.init().then(function () {
                    $categoryTable.append(catStub.stub());
                })
            });
        }
    });

    $.ajax({
        url: tagIdsPath,
        type: 'get',
        success: function (data) {
            data.forEach(function (index) {
                let tagStub = new CategoryTagStub(index, 'tag');
                tagStub.init().then(function () {
                    $tagTable.append(tagStub.stub());
                })
            })
        }
    });

    $.ajax({
        url: postIdsPath,
        type: 'get'
    }).then(function (data) {
        data.forEach(function (index) {
            let postStub = new PostStub(index);
            postStub.init().then(function () {
                $postTable.append(postStub.stub());
            })
        })
    })
}

/**
 * @class
 */
function CategoryTagStub(id, type) {
    this.stub = function () {
        return $stubTag;
    }

    this.init = function () {
        return Promise.resolve($.ajax({
            url: stubPath,
            type: 'get',
            success: function (data) {
                $stubTag = $(data);
                $rename = $stubTag.find('[data-action="rename"]');
                $cancel = $stubTag.find('[data-action="delete"]');
                $th = $stubTag.children('th');
                $td = $stubTag.children('td');
                initialText = $th.html();

                $rename.on('click', renameHandler);
            }
        }));
    }

    let renameHandler = function () {
        $input = $('<input type="text" class="form-control" id="newName' + id + '">');
        $input.val($th.html());
        $th.empty();
        $th.append($input);
        $rename.text('Update');
        $rename.unbind('click', renameHandler);
        $rename.on('click', updateHandler);
        $cancel = $(`<button type="button" class="btn btn-sm btn-secondary" data-id="${id}">Cancel</button>`);
        $td.append($cancel);
        $cancel.on('click', cancelHandler);
    }

    let updateHandler = function () {
        $.ajax({
            url: updatePath,
            type: 'put',
            data: $input.val(),
            contentType: 'text/plain',
            beforeSend: function (xhr) {
                xhr.setRequestHeader(getCsrf().header, getCsrf().token);
            }
        }).then(function (data) {
            initialText = data.name;
            cancelHandler();
        });
    }

    let cancelHandler = function () {
        $th.empty();
        $th.append(initialText);
        $rename.text('Rename');
        $rename.unbind('click', updateHandler);
        $rename.on('click', renameHandler);
        $cancel.unbind('click', cancelHandler);
        $cancel.remove();
    }

    //paths
    const stubPath = `${ajaxHost}/management/${type}Stub/${id}`;
    const updatePath = `${ajaxHost}/blog/${type}/update/${id}`;
    const deletePath = `${ajaxHost}/blog/${type}/delete/${id}`;

    let initialText;

    this.cancel = function () {
        return $cancel;
    }
    //tags
    let $stubTag;
    let $rename;
    let $th;
    let $td;
    let $input;
    let $cancel;
}

/**
 * @class
 */
function PostStub(id) {
    this.init = function () {
        return Promise.resolve($.ajax({
            url: stubPath,
            type: 'get',
            success: function (data) {
                $stubTag = $(data);
            }
        }));
    }

    this.stub = function () {
        return $stubTag;
    }

    const stubPath = `${ajaxHost}/management/postStub/${id}`

    let $stubTag;
}