/*
* RegisterForm.js
*
* Validates registration form entries in real-time and provides on-page feedback/validation
*
* Validates:
*   * Username - shows green 'Username OK' validation text when
*                3 <= username.length < 255 and username is unique
*              - shows red 'Username taken' when 3<=length<255 and
*                username is not unique
*
*   * Password - shows green 'Password OK' validation text when
*                complexity requirements are met
*              - shows red 'Password does not meet complexity requirements'
*                until complexity requirements are met
*
*   * Name     - Shows green '% Name OK' validation text when
*                2 <= %Name.length < 255
*              - Shows red 'Please enter a % Name' until length <= 2
*
*   * Email    - Shows green 'Email address OK' validation text when
*                Email address is in form 'user@domain.tld'
*              - Shows red 'Please enter a valid email address' until
*                entry is in form 'user@domain.tld'
*
*   * Checks   - If user clicks "Submit" while they are unchecked they will flash red validation text
*
* */

/**
 *
 * @constructor
 */
function RegisterForm() {
    //input elements
    const $username = $('#registerUsername');
    const $password = $('#registerPassword');
    const $firstName = $('#registerFirstName');
    const $lastName = $('#registerLastName');
    const $email = $('#registerEmail');
    const $ageCheck = $('#ageCheck');
    const $termsCheck = $('#termsCheck');
    const $submit = $('#registerSubmit');
    const $reset = $('#registerReset');
    const $termsModal = $('#termsModal');

    //validation elements
    const $usernameValidation = $('#usernameValidation');
    const $passwordValidation = $('#passwordValidation');
    const $firstNameValidation = $('#firstNameValidation');
    const $lastNameValidation = $('#lastNameValidation');
    const $emailValidation = $('#emailValidation');

    //TODO: this should be pulled from server-side
    const passwordRegex = new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$");
    const nameRegex = new RegExp("^[a-zA-Z0-9_]*$");
    const emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$");

    //validation booleans
    let usernameValid = false;
    let passwordValid = false;
    let firstNameValid = false;
    let lastNameValid = false;
    let emailValid = false;

    this.init = function () {
        $username.on('input', usernameChange);
        $password.on('input', passwordChange);
        $firstName.on('input', firstNameChange);
        $lastName.on('input', lastNameChange);
        $email.on('input', emailChange);

        $submit.on('click', function (e) {
            e.preventDefault();
            submitClick();
        });

        $reset.on('click', function () {
            $usernameValidation.text('');
            $passwordValidation.text('');
            $firstNameValidation.text('');
            $lastNameValidation.text('');
            $emailValidation.text('');
        })

        $('#registerModal').on('hidden.bs.modal', closeWindow);
        $termsModal.on('hidden.bs.modal', function() {
            $termsCheck.removeAttr('disabled');
        })

        $('#registerForm').on('keypress',function(e) {
            if(e.which === 13) {
                submitClick();
            }
        })
    }

    let usernameChange = function () {
        if (nameRegex.test($username.val())) {
            if ($username.val().length < 2) {
                $usernameValidation.text('');
                usernameValid = false;
            } else if ($username.val().length < 50) {
                let requestUrl = ajaxHost + "/user/exists"
                let requestData = "username=" + $username.val();

                $.ajax({
                    url: requestUrl,
                    type: 'GET',
                    data: requestData,
                    success: function (data) {
                        if (data.message === 'userNotFound') {
                            $usernameValidation.addClass('text-success');
                            $usernameValidation.removeClass('text-danger');
                            $usernameValidation.text('Username is available');
                            usernameValid = true;
                        } else if (data.message === 'userExists') {
                            $usernameValidation.addClass('text-danger');
                            $usernameValidation.removeClass('text-success');
                            $usernameValidation.text('Username is taken');
                            usernameValid = false;
                        } else {
                            $usernameValidation.addClass('text-danger');
                            $usernameValidation.removeClass('text-success');
                            $usernameValidation.text('Unspecified error');
                            usernameValid = false;
                        }
                    }
                })
            } else {
                $usernameValidation.addClass('text-danger');
                $usernameValidation.removeClass('text-success');
                $usernameValidation.text('Username is too long');
                usernameValid = false;
            }
        } else {
            $usernameValidation.addClass('text-danger');
            $usernameValidation.removeClass('text-success');
            $usernameValidation.text('Username can only contain letters, numbers, and underscore');
            usernameValid = false;
        }
    }

    let passwordChange = function () {
        if (passwordRegex.test($password.val())) {
            $passwordValidation.addClass('text-success');
            $passwordValidation.removeClass('text-danger');
            $passwordValidation.text('Password OK');
            passwordValid = true;
        } else {
            $passwordValidation.addClass('text-danger');
            $passwordValidation.removeClass('text-success');
            $passwordValidation.text('Password not acceptable');
            passwordValid = false;
        }
    }

    let firstNameChange = function () {
        if ($firstName.val().length < 2) {
            $firstNameValidation.text('');
            firstNameValid = false;
        } else if ($firstName.val().length < 50) {
            if (nameRegex.test($firstName.val())) {
                $firstNameValidation.addClass('text-success');
                $firstNameValidation.removeClass('text-danger');
                $firstNameValidation.text('First Name OK');
                firstNameValid = true;
            } else {
                $firstNameValidation.addClass('text-danger');
                $firstNameValidation.removeClass('text-success');
                $firstNameValidation.text('Names can only contain letters, numbers, and underscore');
                firstNameValid = false;
            }
        } else {
            $firstNameValidation.addClass('text-danger');
            $firstNameValidation.removeClass('text-success');
            $firstNameValidation.text('Name is too long');
            firstNameValid = false;
        }
    }

    let lastNameChange = function () {
        if ($lastName.val().length < 2) {
            $lastNameValidation.text('');
            lastNameValid = false;
        } else if ($lastName.val().length < 50) {
            if (nameRegex.test($lastName.val())) {
                $lastNameValidation.addClass('text-success');
                $lastNameValidation.removeClass('text-danger');
                $lastNameValidation.text('First Name OK');
                lastNameValid = true;
            } else {
                $lastNameValidation.addClass('text-danger');
                $lastNameValidation.removeClass('text-success');
                $lastNameValidation.text('Names can only contain letters, numbers, and underscore');
                lastNameValid = false;
            }
        } else {
            $lastNameValidation.addClass('text-danger');
            $lastNameValidation.removeClass('text-success');
            $lastNameValidation.text('Name is too long');
            lastNameValid = false;
        }
    }

    let emailChange = function () {
        if (emailRegex.test($email.val())) {
            if ($email.val().length < 5) {
                $emailValidation.text('');
                emailValid = false;
            } else if ($email.val().length < 256) {
                let requestUrl = ajaxHost + "/user/exists"
                let requestData = "email=" + $email.val();

                $.ajax({
                    url: requestUrl,
                    type: 'GET',
                    data: requestData,
                    success: function (data) {
                        if (data.message === 'userNotFound') {
                            $emailValidation.addClass('text-success');
                            $emailValidation.removeClass('text-danger');
                            $emailValidation.text('Email address OK');
                            emailValid = true;
                        } else if (data.message === 'userExists') {
                            $emailValidation.addClass('text-danger');
                            $emailValidation.removeClass('text-success');
                            $emailValidation.text('Address already registered');
                            emailValid = false;
                        } else {
                            $emailValidation.addClass('text-danger');
                            $emailValidation.removeClass('text-success');
                            $emailValidation.text('Unspecified error');
                            emailValid = false;
                        }
                    }
                })
            } else {
                $emailValidation.addClass('text-danger');
                $emailValidation.removeClass('text-success');
                $emailValidation.text('Email address too long');
                emailValid = false;
            }
        } else {
            $emailValidation.addClass('text-danger');
            $emailValidation.removeClass('text-success');
            $emailValidation.text('Please enter a valid email address');
            emailValid = false;
        }
    }

    let submitClick = function () {
        if (!validateAll()) {
            showPopovers();
        } else {
            $('#registerForm').submit();
        }
    }

    let validateAll = function () {
        return usernameValid ?
            passwordValid ?
                firstNameValid ?
                    lastNameValid ?
                        emailValid ?
                            $ageCheck.is(':checked') ?
                                $termsCheck.is(':checked') : false :
                            false :
                        false :
                    false :
                false :
            false;
    }

    let showPopovers = function () {
        let popovers = [];
        if (!usernameValid) {
            popovers.push($usernameValidation);
        }
        if (!passwordValid) {
            popovers.push($passwordValidation);
        }
        if (!firstNameValid) {
            popovers.push($firstNameValidation);
        }
        if (!lastNameValid) {
            popovers.push($lastNameValidation);
        }
        if (!emailValid) {
            popovers.push($emailValidation);
        }
        if ($ageCheck.is(':not(:checked)')) {
            popovers.push($('#ageCheckLabel'));
        }
        if ($termsCheck.is(':not(:checked)')) {
            popovers.push($('#termsCheckLabel'));
        }

        popovers.forEach(function (element) {
            element.popover('show');
        })

        setTimeout(function () {
            popovers.forEach(function (element) {
                element.popover('hide');
            })
        }, 2000)
    }

    let closeWindow = function () {
        $username.val('');
        $usernameValidation.text('');
        $password.val('');
        $passwordValidation.text('');
        $firstName.val('');
        $firstNameValidation.text('');
        $lastName.val('');
        $lastNameValidation.text('');
        $email.val('');
        $emailValidation.text('');
        $ageCheck.attr('checked',false);
        $termsCheck.attr('checked',false);
    }
}