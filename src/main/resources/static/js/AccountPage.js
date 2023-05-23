/*
* AccountPage.js
*
* Collection of properties and methods for dynamic rendering of the
* Account Management page
*
* */

/**
 * @constructor
 * @param {string} username - Username provided by session data
 * */
function AccountPage(username) {
    //URL constants
    const getUserUrl = ajaxHost + '/user';

    //map
    const elementMap = {
        firstName: {
            $span: $('#firstName'),
            $input: $('#firstNameUpdate'),
            $changeButton: $('#firstNameChange'),
            $cancelButton: $('#firstNameCancel')
        },
        lastName: {
            $span: $('#lastName'),
            $input: $('#lastNameUpdate'),
            $changeButton: $('#lastNameChange'),
            $cancelButton: $('#lastNameCancel')
        },
        email: {
            $span: $('#email'),
            $input: $('#emailUpdate'),
            $changeButton: $('#emailChange'),
            $cancelButton: $('#emailCancel')
        }
    }

    //element constants
    const $username = $('#username');
    const $role = $('#userRole');

    //input field constants
    const $oldPassword = $('#oldPassword');
    const $newPassword = $('#newPassword');

    //button constants
    const $passwordChange = $('#passwordChange');
    const $passwordCancel = $('#passwordCancel');

    //sections
    const $acctUser = $('#acctUser');
    const $acctName = $('#acctName');
    const $passwordInput = $('#passwordInput');

    /**
     * @typedef user
     * @type {object}
     * @property {number} userId
     * @property {string} username
     * @property {string} firstName
     * @property {string} lastName
     * @property {string} email
     * @property {string} userRole
     * */
    let user;

    this.init = async function () {
        user = await getUser();

        //make sure the first row is the same height as the others
        $acctUser.height($acctName.height);
        $(window).on('resize', function () {
            $acctUser.height($acctName.height);
        });

        setPage();
    }

    let getUser = function () {
        const requestData = "username=" + username;
        return Promise.resolve($.ajax({
            url: getUserUrl,
            type: 'get',
            data: requestData
        }))
    }

    let setPage = function () {
        $username.text(user.username);
        $role.text(user.userRole);

        for (let key in elementMap) {
            elementMap[key].$span.text(user[key]);
            elementMap[key].$changeButton.on('click', {element: key}, changeButtonHandler);
        }

        $passwordChange.on('click', {action: "show"}, passwordChangeHandler);
    }

    let changeButtonHandler = function (e) {
        const key = e.data.element;

        elementMap[key].$span.addClass('d-none');
        elementMap[key].$input.removeClass('d-none');
        elementMap[key].$cancelButton.removeClass('d-none');
        elementMap[key].$cancelButton.on('click', {element: key}, cancelButtonHandler);
        elementMap[key].$changeButton.text('Update');
        elementMap[key].$changeButton.unbind('click', changeButtonHandler);
        elementMap[key].$changeButton.on('click', {element: key}, updateButtonHandler);
    }

    let updateButtonHandler = function (e) {
        const key = e.data.element;

        const updateUserUrl = ajaxHost + '/user/' + key;
        const requestData = 'id=' + user["userId"] + '&' + key + '=' + elementMap[key].$input.val();
        const csrf = getCsrf();

        $.ajax({
            url:updateUserUrl,
            type: 'PUT',
            data: requestData,
            beforeSend: function(xhr) {
                xhr.setRequestHeader(csrf.header,csrf.token);
            },
            success: function() {
                elementMap[key].$span.text(elementMap[key].$input.val());
                elementMap[key].$span.removeClass('d-none');
                elementMap[key].$input.addClass('d-none');
                elementMap[key].$input.val('');
                elementMap[key].$changeButton.text('Change');
                elementMap[key].$changeButton.unbind('click',updateButtonHandler);
                elementMap[key].$changeButton.on('click',{element:key},changeButtonHandler);
                elementMap[key].$changeButton.attr('data-content','Changed!');
                elementMap[key].$changeButton.popover('show');
                elementMap[key].$cancelButton.addClass('d-none');
                setTimeout(function () {
                    elementMap[key].$changeButton.popover('hide');
                    elementMap[key].$changeButton.attr('data-content','');
                },2000);
            }
        })
    }

    let cancelButtonHandler = function (e) {
        const key = e.data.element;

        elementMap[key].$input.addClass('d-none');
        elementMap[key].$input.val('');
        elementMap[key].$span.removeClass('d-none');
        elementMap[key].$changeButton.text('Change');
        elementMap[key].$changeButton.unbind('click',updateButtonHandler);
        elementMap[key].$changeButton.on('click',{element:key},changeButtonHandler);
        elementMap[key].$changeButton.attr('data-content','Cancelled');
        elementMap[key].$changeButton.popover('show');
        elementMap[key].$cancelButton.addClass('d-none');
        setTimeout(function() {
            elementMap[key].$changeButton.popover('hide');
            elementMap[key].$changeButton.attr('data-content','');
        }, 2000);
    }

    let passwordChangeHandler = function (e) {
        if (e.data.action === 'show') {
            $passwordInput.removeClass('d-none');
            $passwordCancel.removeClass('d-none');
            $passwordCancel.on('click',passwordCancelHandler);
            $passwordChange.text('Submit');
            $passwordChange.unbind('click',passwordChangeHandler);
            $passwordChange.on('click',{action:'submit'},passwordChangeHandler);
        } else {
            const requestUrl = ajaxHost + '/user/password';
            const requestData = 'id=' + user.userId +
                '&oldPassword=' + $oldPassword.val() + '&newPassword=' + $newPassword.val();
            const csrf = getCsrf();

            console.log(requestData);

            $.ajax({
                url: requestUrl,
                type: 'PUT',
                data: requestData,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(csrf.header,csrf.token);
                },
                success: function (data) {
                    switch(data.message) {
                        case 'userNotFound':
                            $passwordChange.attr('data-content','Username not found. This should not happen.');
                            break;
                        case 'oldPasswordIncorrect':
                            $passwordChange.attr('data-content','The old password was incorrect');
                            break;
                        case 'passwordInsecure':
                            $passwordChange.attr('data-content','The new password does not meet complexity requirements');
                            break;
                        case 'passwordHistoryFailure':
                            $passwordChange.attr('data-content','The new password was the same as the old password');
                            break;
                        case 'passwordChanged':
                            $oldPassword.val('');
                            $newPassword.val('');
                            $passwordInput.addClass('d-none');
                            $passwordChange.attr('data-content','Password changed!');
                            break;
                        default:
                            $passwordChange.attr('data-content','An unspecified error has occurred');
                    }
                    $passwordChange.popover('show');
                    setInterval(function() {

                        $passwordChange.popover('hide');
                        $passwordChange.attr('data-content','');
                    },2000);
                }
            })
        }
    }

    let passwordCancelHandler = function () {
        $oldPassword.val('');
        $newPassword.val('');
        $passwordInput.addClass('d-none');
        $passwordChange.text('Change Password');
        $passwordChange.unbind('click',passwordChangeHandler);
        $passwordChange.on('click',{action:'show'},passwordChangeHandler);
        $passwordCancel.addClass('d-none');
        $passwordCancel.unbind('on',passwordCancelHandler);
    }
}