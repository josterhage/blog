/*
* LoginForm.js
*
* Validates login and provides on-page feedback/validation. Also manages the Forgot Password functionality.
*
* Gets value of #loginUsername and #loginPassword then asks the server if they form
* a valid credential. The server provides a boolean response. If true, LoginForm submits the form
* and login proceeds normal. If false, LoginForm gives the user a red "Invalid Credentials" message.
*
* */

/**
 * @class
 * */
function LoginForm () {
    const userCheckUrl = ajaxHost + '/user/check';
    const resetPasswordUrl = ajaxHost + '/account/resetPassword';

    //modal constants
    const $loginModal = $('#loginModal');
    const $loginModalLabel = $('#loginModalLabel');
    const $loginForm = $('#loginForm');
    const $resetForm = $('#resetForm');

    //input field constants
    const $loginUsername = $('#loginUsername');
    const $loginPassword = $('#loginPassword');
    const $resetUsername = $('#resetUsername');

    //button constants
    const $loginClose = $('#loginClose');
    const $loginSubmit = $('#loginSubmit');
    const $resetSubmit = $('#resetSubmit');
    const $resetCancel = $('#resetCancel');

    //forgot password link
    const $forgotPassword = $('#forgotPassword');

    const $loginBottom = $('#loginBottom');

    this.init = function() {
        $loginSubmit.on('click', function(e) {
            e.preventDefault();
            checkLogin();
        })

        $forgotPassword.on('click', forgotPasswordInit);

        $loginClose.on('click',closeWindow);
        $loginModal.on('hidden.bs.modal', closeWindow);

        $loginModal.on('keypress', function(e) {
            if(e.which === 13) {
                checkLogin();
            }
        })
    }

    let checkLogin = function() {
        if($loginUsername.val().length < 3 || $loginPassword.val().length < 8) {
            showErrorMessage('Invalid username or password');
            return;
        }

        const requestData = 'username=' + $loginUsername.val() + '&password=' + $loginPassword.val();

        $.ajax({
            url: userCheckUrl,
            type: 'GET',
            data: requestData,
            success: function (data) {
                if(data.actionSuccessful === true) {
                    $loginForm.submit();
                } else if (data.message === 'invalidCredentials') {
                    showErrorMessage('Invalid username or password');
                } else if (data.message === 'accountLocked') {
                    showErrorMessage('Your account has been locked due to too many failed login attempts');
                } else {
                    showErrorMessage('Unspecified error, this shouldn\'t happen');
                }
            }
        })
    }

    let showErrorMessage = function(message) {
        let $errorMessage=$('<span class="text-danger"></span>');
        $errorMessage.append(message);
        $loginBottom.append($errorMessage);
        $errorMessage.fadeOut(2000, function() {
            $errorMessage.remove();
        })
    }

    let showSuccessMessage = function(message) {
        let $successMessage = $('<span class="text-success"></span>')
        $successMessage.append(message);
        $loginBottom.append($successMessage);
        $successMessage.fadeOut(3000,function() {
            $successMessage.remove();
        })
    }

    let forgotPasswordInit = function() {
        $loginModalLabel.text('Reset Password');
        $loginForm.addClass('d-none');
        $resetForm.removeClass('d-none');
        $resetSubmit.on('click',function (e) {
            e.preventDefault();
            forgotPasswordSubmit();
        })
        $resetCancel.on('click',loginFormRestore);
        $forgotPassword.addClass('d-none');
    }

    let forgotPasswordSubmit = function() {
        if($resetUsername.val().length < 3) {
            showErrorMessage("Invalid username");
            return;
        }

        const requestData = 'resetUsername=' + $resetUsername.val();
        let csrf = getCsrf();

        $.ajax({
            url: resetPasswordUrl,
            type: 'POST',
            data: requestData,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(csrf.header, csrf.token);
            },
            success: function (data) {
                if(data.message === 'userNotFound') {
                    showErrorMessage('Username not found');
                } else if (data.message === 'passwordResetSent') {
                    showSuccessMessage('Reset message sent, please check your registered email address for a reset link.');
                }
            }
        })
    }

    let loginFormRestore = function() {
        $loginForm.removeClass('d-none');
        $resetForm.addClass('d-none');
        $resetUsername.val('');
        $forgotPassword.removeClass('d-none');
    }

    let closeWindow = function() {
        console.log('yay');
        $loginUsername.val('');
        console.log($loginUsername.val());
        $loginPassword.val('');
        $resetUsername.val('');
        $loginForm.removeClass('d-none');
        $resetForm.addClass('d-none');
        $forgotPassword.removeClass('d-none');
    }
}