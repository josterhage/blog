/*
 * NewPost.js -
 *
 * data structures and methods for rendering and submitting new posts
 *
 */

/*
 * NewPost.js -
 *
 * data structures and methods for rendering and submitting new posts
 *
 */

/**
 *
 * @constructor
 */
function NewPost() {
    let newCharHandler = function (boxBlob) {
        boxBlob.span().removeClass('badge');
        boxBlob.span().removeClass('badge-primary');
        let str = boxBlob.text();
        if (str.length < 3) {
            $recommendationSpan.empty();
            return;
        }

        $recommendationSpan.empty();

        //get first tag starting with the letters
        $.ajax({
            url: ajaxHost + tagLike + boxBlob.text(),
            type: 'get',
            success: function (data) {
                if (data.name === undefined) {
                    return;
                }
                if (data.name.length === str.length) {
                    return;
                }
                let recStr = data.name.slice(str.length);
                $recommendationSpan.append(recStr);
                boxBlob.span().append($recommendationSpan);
                $recommendationSpan.on('click', function () {
                    tagEditor.caretToEnd(boxBlob);
                })
            }
        })
    }

    let blobChangedHandler = function (newBlob, oldBlob) {
        $recommendationSpan.empty();
        $recommendationSpan.remove();
        oldBlob.span().addClass('badge');
        oldBlob.span().addClass('badge-primary');
        if (newBlob.text() !== '\xa0') {
            newCharHandler(newBlob);
        }
    }

    let newBlobHandler = function (oldBlob) {
        $recommendationSpan.empty();
        $recommendationSpan.remove();
        oldBlob.span().addClass('badge');
        oldBlob.span().addClass('badge-primary');
    }

    let tabHandler = function (blob, index) {
        let recStr = $recommendationSpan.text();
        $recommendationSpan.empty();
        $recommendationSpan.remove();
        blob.span().addClass('badge');
        blob.span().addClass('badge-primary');
        tagEditor.updateBlobText(index, blob.text() + recStr);
    }

    let invalidCharacter = function (charCode, boxBlob) {
        boxBlob.span().attr('data-container', 'body');
        boxBlob.span().attr('data-toggle', 'popover');
        boxBlob.span().attr('data-placement', 'top');
        boxBlob.span().attr('data-content', 'Tag names may only contain alphanumeric characters.');
        boxBlob.span().popover('show');
        setTimeout(function () {
            boxBlob.span().popover('hide');
            boxBlob.span().attr('data-content', '');
            boxBlob.span().attr('data-placement', '');
            boxBlob.span().attr('data-toggle', '');
            boxBlob.span().attr('data-container', '');
        }, 1500);
    }

    let submitClick = function () {
        let post = {};
        post.postId = null;
        post.createdDateTime = null;
        post.lastUpdateDateTime = null;
        post.title = $postTitle.val();
        post.body = $postBody.val();
        post.edited = false;
        post.author = null;
        post.comments = null;
        post.category = $postCategory.val();
        post.tags = getTags();

        $.ajax({
            url: ajaxHost + newPost,
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(post),
            beforeSend: function (xhr) {
                xhr.setRequestHeader(getCsrf().header, getCsrf().token);
            },
            success: function (data) {
                setTimeout(function () {
                    window.location.replace(`${ajaxHost}/?post=${data.postId}`);
                }, 1500);
            }
        })
    }

    let resetClick = function () {
        tagEditor.reset();
    }

    let getTags = function () {
        let tags = [];
        let i = 0;
        let dataStr = '[data-index="' + i + '"]';
        while ($(dataStr).length > 0) {
            if (i !== 0 && i % 2 !== 0) {
                i++;
                dataStr = '[data-index="' + i + '"]';
                continue;
            }
            tags.push({tagId: null, name: $(dataStr).text()});
            i++;
            dataStr = '[data-index="' + i + '"]';
        }

        return tags;
    }

    let populateSelect = function () {
        $postCategory.append('<option></option>');
        $.ajax({
            url: ajaxHost + category,
            type: 'get',
            success: function (data) {
                data.forEach(function (item) {
                    $postCategory.append($('<option value="' + item.name + '">' + item.name + '</option>'));
                })
            }
        })
    }

    //tags
    let $postTitle = $('#postTitle');
    let $postCategory = $('#postCategory');
    let $postTags = $('#postTags');
    let $postBody = $('#postBody');
    let $postSubmit = $('#postSubmit');
    let $postReset = $('#postReset');

    //js-defined tags
    let $recommendationSpan = $('<span style="color:#cccccc;" id="recommendationSpan"></span>');

    //paths
    const tagLike = '/blog/tag/tagLike/';
    const category = '/blog/category';
    const newPost = '/blog/post/new';

    populateSelect();

    let tagEditor = new TagEditor($postTags);
    tagEditor.on('newChar', newCharHandler);
    tagEditor.on('newBlob', newBlobHandler);
    tagEditor.on('blobChanged', blobChangedHandler);
    tagEditor.on('tab', tabHandler);
    tagEditor.on('invalidCharacter', invalidCharacter);

    //if we don't prevent the default clicking submit will try to submit everything
    //as url-encoded to the current path
    $postSubmit.on('click', function (e) {
        e.preventDefault();
        submitClick();
    })

    //no need to prevent the default because we're adding, not replacing
    $postReset.on('click', resetClick);
}

/**
 *
 * @constructor
 */
function TagEditor($element) {
    /**
     *
     * @param {jQuery} $element
     * @param {string} text
     * @constructor
     */


    /**
     * @param {string} text
     * @constructor
     */
    function TextBlob(text = '') {
        this.text = function (newText) {
            if (newText === undefined) {
                return text;
            }
            text = newText;
        }

        this.addChar = function (ch, pos) {
            if (typeof (ch) !== 'string') {
                return;
            }

            if (pos === text.length) {
                text = text + ch;
                return;
            }

            if (text.length === 1) {
                text = pos === 0 ? ch + text : text + ch;
                return;
            }

            let leftBlob = text.slice(0, pos);
            let rightBlob = text.slice(pos);
            text = leftBlob + ch + rightBlob;
        }

        this.removeChar = function (pos) {
            if (pos === text.length) {
                text = text.slice(0, text.length - 1);
                return;
            }

            let leftBlob = text.slice(0, pos - 1);
            let rightBlob = text.slice(pos);
            text = leftBlob + rightBlob;
        }

        this.slice = function (startPos, endPos) {
            if (endPos === undefined) {
                endPos = text.length - 1;
            }

            return new TextBlob(text.slice(startPos, endPos));
        }
    }

    /**
     * @param {TextBlob} blob
     * @param {number} startPosition
     * @param {number} endPosition
     * @constructor
     */
    function BoxBlob(blob = new TextBlob(), startPosition = 0, endPosition = 0) {
        /**
         * @param {TextBlob} newBlob
         * @returns {TextBlob}
         */
        this.blob = function (newBlob) {
            if (newBlob === undefined) {
                return blob;
            }
            blob = newBlob;
        }

        /**
         * @param {number} newPosition
         */
        this.startPosition = function (newPosition = undefined) {
            if (newPosition === undefined) {
                return startPosition
            }
            startPosition = newPosition;
            endPosition = startPosition + blob.text().length;
        }

        /**
         * @param {number} newPosition
         */
        this.endPosition = function (newPosition = undefined) {
            if (newPosition === undefined) {
                return endPosition;
            }
            endPosition = newPosition;
        }

        /**
         * @param {string} text
         * @returns {string}
         */
        this.text = function (text = undefined) {
            if (text === undefined) {
                return blob.text();
            }
            blob.text(text);
            endPosition = startPosition + text.length;
            $span.text(text);
        }

        this.addChar = function (ch, pos) {
            if (typeof (ch) !== 'string') {
                return;
            }
            if (pos === undefined) {
                pos = blob.text().length;
            }
            blob.addChar(ch, pos - startPosition);
            endPosition++;
            $span.text(blob.text());
        }

        this.removeChar = function (pos) {
            if (pos === undefined) {
                pos = blob.text().length;
            }
            blob.removeChar(pos - startPosition);
            endPosition--;
            $span.text(blob.text());
        }

        this.shift = function (offset) {
            startPosition += offset;
            endPosition += offset;
        }

        this.containsPosition = function (pos) {
            return pos >= startPosition && pos <= endPosition;
        }

        this.slice = function (startPos, endPos) {
            if (endPos === undefined) {
                endPos = endPosition - startPosition;
            }
            return new BoxBlob(blob.slice(startPos, endPos), startPosition + startPos, startPosition + endPos);
        }

        /**
         * @returns {*|Window.jQuery|HTMLElement}
         */
        this.span = function () {
            return $span;
        }

        if (endPosition === 0) {
            endPosition = startPosition + blob.text().length;
        }

        let $span = $('<span data-index=""></span>');
        $span.text(blob.text());

        $span.on('click', function () {
            if (caretPosition >= startPosition && caretPosition <= endPosition) {
                return;
            }
            let oldCaret = caretPosition;
            caretPosition = getCaret($span[0]) + startPosition;
            let oldBlob;
            for (let i = 0; i < boxBlobs.length; i++) {
                if (boxBlobs[i].containsPosition(oldCaret)) {
                    oldBlob = boxBlobs[i];
                    break;
                }
            }
            for (let i = 0; i < boxBlobs; i++) {
                if (boxBlobs[i].containsPosition(caretPosition)) {
                    console.log(boxBlobs[i].text());
                    events.blobChanged.forEach(function (handler) {
                        handler(boxBlobs[i], oldBlob);
                    })
                }
            }
        })
    }

    this.element = function (value) {
        if (value === undefined) {
            return $element;
        } else if (!(value instanceof jQuery)) {
            return;
        }
        $element = value;
    }

    this.on = function (event, handler) {
        events[event].push(handler);
    }

    this.getBlob = function (index) {
        if (typeof (index) === 'number' && index < boxBlobs.length + 1) {
            return boxBlobs[index];
        }
    }

    this.caretToEnd = function (blob) {
        caretPosition = blob.endPosition();
        setCaret(blob);
    }

    this.updateBlobText = function (index, text) {
        boxBlobs[index].text(text);
        $element.empty();
        boxBlobs.forEach(function (blob, index, blobArr) {
            if (index > 0) {
                blob.startPosition(blobArr[index - 1].endPosition());
            }
            $element.append(blob.span());
        })
        caretPosition = boxBlobs[index].endPosition();
        setCaret(boxBlobs[index]);
    }

    this.reset = function () {
        $element.empty();
        boxBlobs.length = 0;
        boxBlobs.push(new BoxBlob());
        caretPosition = 0;
        boxBlobs[0].span().attr('data-index', 0);
        $element.append(boxBlobs[0].span());
    }

    let keyDownHandler = function (event) {
        event.preventDefault();
        let charAdded = false, charRemoved = false;
        switch (event.which) {
            case undefined:
                return;
            case 8:
                let blobRemoved = false;
                boxBlobs.forEach(function (boxBlob, index, blobs) {
                    if (charRemoved) {
                        boxBlob.shift(-1);
                        return;
                    }
                    if (blobRemoved) {
                        boxBlob.startPosition(blobs[index - 1].endPosition());
                        return;
                    }
                    if (boxBlob.containsPosition(caretPosition) && caretPosition > 0) {
                        if (boxBlob.text() !== '\xa0') {
                            if (boxBlob.text().length === 0) {
                                blobs.splice(index, 1);
                                if (blobs[index - 1].text() === '\xa0') {
                                    blobs.splice(index - 1, 1);
                                }
                                $element.empty();
                                blobs.forEach(function (blob) {
                                    $element.append(blob.span());
                                });
                                caretPosition = blobs[index - 2].endPosition();
                                setCaret(blobs[index - 2]);
                                events.newChar.forEach(function (handler) {
                                    handler(boxBlob);
                                })
                                return;
                            }

                            boxBlob.removeChar(caretPosition);

                            charRemoved = true;
                        } else if (blobs[index + 1].text().length === 0) {
                            blobs.splice(index, 1);
                            blobs.splice(index, 1);
                            blobRemoved = true;
                            $element.empty();
                            blobs.forEach(function (blob) {
                                $element.append(blob.span());
                            });
                            caretPosition = blobs[index - 1].endPosition();
                            setCaret(blobs[index - 1]);
                            events.newChar.forEach(function (handler) {
                                handler(blobs[index - 1]);
                            })
                            return;
                        }
                        caretPosition--;
                        setCaret(boxBlob);
                        events.newChar.forEach(function (handler) {
                            handler(boxBlob);
                        })
                    }

                })
                //printBlobs();
                return;
            case 9:
                boxBlobs.forEach(function (boxBlob, index) {
                    if (boxBlob.containsPosition(caretPosition) && boxBlob.text() !== '\xa0') {
                        events.tab.forEach(function (handler) {
                            handler(boxBlob, index);
                        })
                        let e = jQuery.Event('keydown');
                        e.which = 32;
                        $element.trigger(e);
                    }
                })
                return;
            case 13:
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 27:
                return;
            case 32:
                boxBlobs.forEach(function (boxBlob, index, blobArr) {
                    if (boxBlob.containsPosition(caretPosition)) {
                        if (boxBlob.text() === '\xa0' || boxBlob.text().length === 0) {
                            events.spaceIgnored.forEach(function (handler) {
                                handler();
                            })
                            return;
                        }

                        //we need three new blobs: everything in this blob before the caret, a space
                        //and everything in this blob after the caret
                        let leftBlob = boxBlob.slice(0, caretPosition - boxBlob.startPosition());
                        leftBlob.span().attr('data-index', index);
                        let spaceBlob = new BoxBlob(new TextBlob('\xa0'), leftBlob.endPosition());
                        spaceBlob.span().attr('data-index', index + 1);
                        let rightBlob = caretPosition < boxBlob.endPosition() ? boxBlob.slice(caretPosition - boxBlob.startPosition()) : new BoxBlob(new TextBlob(), spaceBlob.endPosition());
                        rightBlob.span().attr('data-index', index + 2);
                        if (caretPosition < boxBlob.endPosition()) {
                            rightBlob.shift(1);
                        }
                        events.newBlob.forEach(function (handler) {
                            handler(leftBlob, spaceBlob, rightBlob, caretPosition);
                        })
                        blobArr[index] = leftBlob;
                        blobArr.splice(index + 1, 0, spaceBlob);
                        blobArr.splice(index + 2, 0, rightBlob);
                        $element.empty();
                        blobArr.forEach(function (blob) {
                            $element.append(blob.span());
                        })
                        caretPosition = spaceBlob.endPosition();
                        setCaret(spaceBlob);
                        //}
                        //}
                    }
                })
                //printBlobs();
                return;
            case 33:
            case 34:
                return;
            case 35:
                caretPosition = boxBlobs[boxBlobs.length - 1].endPosition();
                setCaret(boxBlobs[boxBlobs.length - 1]);
                //printBlobs();
                return;
            case 36:
                caretPosition = 0;
                setCaret(boxBlobs[0]);
                //printBlobs();
                return;
            case 37:
                if (caretPosition > 0) {
                    caretPosition--;
                    boxBlobs.forEach(function (boxBlob, index) {
                        if (boxBlob.containsPosition(caretPosition) && boxBlob.text() !== '\xa0') {
                            if (!boxBlob.containsPosition(caretPosition + 1) && boxBlob.text() !== '\xa0') {
                                events.blobChanged.forEach(function (handler) {
                                    let oldBlob = boxBlobs[index + 1].text() !== '\xa0' ? boxBlobs[index + 1] : boxBlobs[index + 2];
                                    handler(boxBlob, oldBlob);
                                })
                            }
                            setCaret(boxBlob);

                        }
                    })
                }
                //printBlobs();
                return;
            case 38:
                return;
            case 39:
                boxBlobs.forEach(function (boxBlob, index) {
                    if (boxBlob.containsPosition(caretPosition + 1) && boxBlob.text() !== '\xa0') {
                        caretPosition++;
                        setCaret(boxBlob);
                        if (!boxBlob.containsPosition(caretPosition - 1)) {
                            events.blobChanged.forEach(function (handler) {
                                let oldBlob = boxBlobs[index - 1].text() !== '\xa0' ? boxBlobs[index - 1] : boxBlobs[index - 2];
                                handler(boxBlob, oldBlob);
                            })
                        }
                    }
                })
                //printBlobs();
                return;
            case 40:
            case 45:
                return;
            case 46:
                boxBlobs.forEach(function (boxBlob, index, blobs) {
                    let blobRemoved = false;
                    if (charRemoved) {
                        boxBlob.shift(-1);
                        return;
                    }
                    if (blobRemoved) {
                        boxBlob.startPosition(blobs[index - 1].endPosition());
                        return;
                    }
                    if (boxBlob.containsPosition(caretPosition + 1)) {
                        if (boxBlob.text() === '\xa0') {
                            blobs.splice(index, 1);
                            blobs.splice(index, 1);
                            $element.empty();
                            blobs.forEach(function (blob) {
                                $element.append(blob.span());
                            });
                            caretPosition = blobs[index - 1].endPosition();
                            setCaret(blobs[index - 1]);
                            return;
                        }
                        boxBlob.removeChar(caretPosition + 1);
                        setCaret(boxBlob);
                        charRemoved = true;
                        events.newChar.forEach(function (handler) {
                            handler(boxBlob);
                        })
                    }
                })
                //printBlobs();
                return;
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
            case 65:
            case 66:
            case 67:
            case 68:
            case 69:
            case 70:
            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
            case 77:
            case 78:
            case 79:
            case 80:
            case 81:
            case 82:
            case 83:
            case 84:
            case 85:
            case 86:
            case 87:
            case 88:
            case 89:
            case 90:
                boxBlobs.forEach(function (boxBlob) {
                    if (charAdded) {
                        boxBlob.shift(1);
                        return;
                    }
                    if (boxBlob.containsPosition(caretPosition) && boxBlob.text() !== '\xa0') {
                        boxBlob.addChar(charMap[event.which], caretPosition);
                        caretPosition++;
                        setCaret(boxBlob);
                        charAdded = true;
                        events.newChar.forEach(function (handler) {
                            handler(boxBlob);
                        })
                    }
                });
                //printBlobs();
                return;
            default:
                for (let i = 0; i < boxBlobs.length; i++) {
                    if (boxBlobs[i].containsPosition(caretPosition)) {
                        events.invalidCharacter.forEach(function (handler) {
                            handler(event.which, boxBlobs[i]);
                        })
                        break;
                    }
                }
                return;
        }
    }

    let setCaret = function (blob) {
        let $span = blob.span();

        let range = document.createRange();
        let sel = window.getSelection();
        let el = $span[0].childNodes.length > 0 ? $span[0].childNodes[0] : $span[0];

        range.setStart(el, caretPosition - blob.startPosition());
        range.setEnd(el, caretPosition - blob.startPosition());
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    let getCaret = function (element) {
        let sel;
        let range;
        sel = window.getSelection();
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode === element) {
            return range.endOffset;
        }
        return 0;
    }

    let charMap = {
        48: '0', 49: '1', 50: '2', 50: '3', 51: '4', 52: '5', 53: '6', 54: '7', 55: '8', 56: '9',
        65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j',
        75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
        85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z'
    }

    let events = {
        newBlob: [],
        blobChanged: [],
        newChar: [],
        remChar: [],
        tab: [],
        invalidCharacter: [],
        spaceIgnored: []
    }

    let boxBlobs = [new BoxBlob()];
    let caretPosition = 0;

    boxBlobs[0].span().attr('data-index', 0);
    $element.append(boxBlobs[0].span());
    $element.on('keydown', function (e) {
        if (!(e.which > 111 && e.which < 124)) {
            e.preventDefault();
            keyDownHandler(e);
        }
    })

    $element.on('click', function (e) {
        e.preventDefault();
        if ($element[0].lastChild.getBoundingClientRect().right < e.pageX) {
            caretPosition = boxBlobs[boxBlobs.length - 1].endPosition();
            setCaret(boxBlobs[boxBlobs.length - 1]);
        }
    })
}