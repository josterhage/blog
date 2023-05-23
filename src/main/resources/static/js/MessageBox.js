/*
* MessageBox.js
*
* Reads server messages and displays context-specific modal boxes
*
* */

/**
 * @class
 * */
function MessageBox() {
    let $dialogBox = $('#messageBox');
    let messages;

    this.init = async function() {
        messages = await loadMessages();
        setText();
        showDialog();
    }

    let loadMessages = function() {
        let requestUrl = ajaxHost + '/site-data/messages.json';

        return Promise.resolve($.ajax({
            url: requestUrl,
            type: 'GET'
        }))
    }

    let setText = function() {
        let dialogMessage = messages.find(({message}) => message === actionStatus.message);

        $('#dialogHeader').append(dialogMessage.header);
        $('#dialogMessage').append(dialogMessage.body);
    }

    let showDialog = function() {
        $dialogBox.modal('show');
    }
}