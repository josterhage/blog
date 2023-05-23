/*
* UserManagementPage.js
*
* Collection of properties and methods for dynamic rendering of the
* Multi-User management page
*
* */

/**
 * @class
 * */
function UserManagementPage() {
    this.init = async function () {
        await refreshData();
        headerRow = new HeaderRow();
        userRows = buildUserRows();
        navRow = new NavigationRow(pages, rowNames.length, onNavigate);
        setupTable();
    }

    this.getTable = function () {
        return $table;
    }

    this.getUserIds = function () {
        return userIds;
    }

    this.getCurrentSet = function () {
        return currentSet;
    }

    let refreshData = async function () {
        userIds = await getUserIds();
        pages = setPages();
        lastPageCount = setLastPageCount();
        currentSet = await getCurrentSet();
    }

    let setupTable = function () {
        $table = $('<table class="table overflow-auto"></table>');
        $table.empty();
        $tableBody = $('<tbody></tbody>');
        $tableBody.empty();
        $table.append($tableBody);
        $table.append(headerRow.getHeaderRow());
        userRows.forEach(function (userRow) {
            $table.append(userRow.getRow());
        });
        $table.append(navRow.getRow());
    }

    //helper functions
    let getUserIds = async function () {
        return Promise.resolve($.ajax({
            url: requestUrl + '/allIds',
            type: 'get'
        })).then(function (data) {
            return data;
        });
    }

    let setPages = function () {
        return Math.ceil(userIds.length / 10);
    }

    let setLastPageCount = function () {
        return userIds.length % 10;
    }

    /**
     *
     * @returns {Promise<*|jQuery>}
     */
    let getCurrentSet = function () {
        let lastItem, firstItem, subIds, dataString;

        if (userIds.length > 10) {
            lastItem = currentPage === pages ? lastPageCount + ((currentPage - 1) * 10) : usersPerPage * currentPage;
            firstItem = lastItem - (currentPage === pages ? lastPageCount : usersPerPage);
            subIds = userIds.slice(firstItem, lastItem);
        } else {
            subIds = userIds;
        }

        dataString = 'userIds=' + subIds.toString();

        return Promise.resolve($.ajax({
            url: requestUrl + '/manyByIds',
            type: 'get',
            data: dataString,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(getCsrf().header, getCsrf().token);
            }
        })).then(function (data) {
            return data;
        })
    }

    // assumes getCurrentSet is valid
    let buildUserRows = function () {
        let rows = [];
        currentSet.forEach(function (user) {
            rows.push(new UserRow(user, onUserDelete));
        });

        return rows;
    }

    // callbacks
    let onUserDelete = async function () {
        refreshData().then(function () {
            userRows = buildUserRows();
            setupTable();
            $('.table').replaceWith($table);
        });
    }

    /**
     *
     * @param {number} newPage
     */
    let onNavigate = function (newPage) {
        currentPage = newPage;
        refreshData().then(function () {
            userRows = buildUserRows();
            setupTable();
            $('.table').replaceWith($table);
        });
    }

    const requestUrl = ajaxHost + '/user';

    const rowNames = ['UserId', 'Username', 'First Name', 'Last Name',
        'Email', 'Role', 'Confirmed', 'Enabled', 'Update', 'Delete'];

    let userIds;

    let usersPerPage = 10;
    let pages;
    let lastPageCount;
    let currentPage = 1;
    let currentSet;

    //class instances
    let headerRow;
    let userRows;
    let navRow;

    //jQuery elements
    let $table, $tableBody;


    // child classes

    /**
     * @class
     * */
    function HeaderRow() {
        let $row = $('<tr></tr>');

        rowNames.forEach(function (rowName) {
            $row.append($('<th class="p-1 p-lg-2"></th>').append(rowName));
        })

        /**
         * @returns {*|Window.jQuery|HTMLElement}
         * */
        this.getHeaderRow = function () {
            return $row;
        }
    }

    /**
     * @constructor
     * @param {object} user
     * @param {function} deleteCallback
     * @typedef user
     * @type {object}
     * @property {number} userId
     * @property {string} username
     * @property {string} firstName
     * @property {string} lastName
     * @property {string} email
     * @property {string} userRole
     * @property {boolean} confirmed
     * @property {boolean} enabled
     */
    function UserRow(user, deleteCallback) {
        /**
         * @returns {*|Window.jQuery|HTMLElement}
         */
        this.getRow = function () {
            return $row;
        }

        let updateClickHandler = function () {
            let confirmedVal = $confirmed.is(':checked');
            let enabledVal = $enabled.is(':checked');
            let roleVal = $roleSelect.val();
            let actionMessage;
            let update = false;

            let $header = $('#rowHeader' + user.userId);
            $header.empty();
            $header.append($('<div class="spinner-border text-center" role="status"></div>'));

            if (user.userRole !== roleVal) {
                user.userRole = roleVal;
                update = true;
            }

            if (user.confirmed !== confirmedVal) {
                user.confirmed = confirmedVal;
                update = true;
            }

            if (user.enabled !== enabledVal) {
                user.enabled = enabledVal;
                update = true;
            }

            if (update) {
                let requestData = "user=" + JSON.stringify(user);
                $.ajax({
                    url: requestUrl + "/update",
                    type: 'put',
                    data: JSON.stringify(user),
                    dataType: 'json',
                    contentType: 'application/json',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(getCsrf().header, getCsrf().token);
                    },
                    success: function (data) {
                        let $actionHeader = $('#rowHeader' + user.userId);
                        if (data.message === 'userUpdated') {
                            $actionHeader.attr('data-content', 'User updated');
                        } else if (data.message === 'userNotFound') {
                            $actionHeader.attr('data-content', 'User not found');
                        } else {
                            $actionHeader.attr('data-content', 'An unspecified error has occurred');
                        }
                        // $header.empty();
                        // $header.append(user.userId);
                        $actionHeader.popover('show');
                        setTimeout(function () {
                            $actionHeader.popover('hide');
                            $actionHeader.attr('data-content', '');
                        }, 2000);
                    }
                });
            }
            $header.empty();
            $header.append(user.userId);
        }

        let deleteClickHandler = function () {
            if (confirm("Are you sure you want to delete user\nUserId: " + user.userId)) {
                let actionMessage;
                $.ajax({
                    url: requestUrl + "/delete/" + user.userId,
                    type: 'delete',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(getCsrf().header, getCsrf().token);
                    },
                    success: function (data) {
                        let $actionHeader = $('#rowHeader' + user.userId);
                        $actionHeader.attr('data-content', 'User deleted.');
                        $actionHeader.popover('show');
                        setTimeout(function () {
                            $actionHeader.popover('hide');
                            $actionHeader.attr('data-content', '');
                            deleteCallback();
                        }, 2000);
                    }
                })


            }
        }

        let $row = $('<tr></tr>');

        let $rowHeader = $('<th scope="row" class="p-1 p-lg-2" id="rowHeader' + user.userId + '"></th>');
        $rowHeader.append(user.userId);
        $rowHeader.attr('data-container', 'body');
        $rowHeader.attr('data-toggle', 'popover');
        $rowHeader.attr('data-placement', 'left');

        $row.append($rowHeader);
        $row.append($('<td class="p-1 p-lg-2"></td>').append(user.username));
        $row.append($('<td class="p-1 p-lg-2"></td>').append(user.lastName));
        $row.append($('<td class="p-1 p-lg-2"></td>').append(user.firstName));
        $row.append($('<td class="p-1 p-lg-2"></td>').append(user.email));

        let $roleSelect = $('<select></select>');
        $roleSelect.append($('<option value="READER">Reader</option>'));
        $roleSelect.append($('<option value="CONTRIBUTOR">Contributor</option>'));
        $roleSelect.append($('<option value="OWNER">Owner</option>'));
        $roleSelect.children('option[value="' + user.userRole + '"]').attr('selected', 'selected');
        $row.append($('<td class="align-middle"></td>').append($roleSelect));

        let $confirmed = $('<input type="checkbox" style="margin-top:.3rem;margin-left:-1.25rem">');
        $confirmed.prop('checked', user.confirmed);
        $confirmed.prop('disabled', user.confirmed);
        $row.append($('<td class="text-center"></td>').append($confirmed));

        let $enabled = $('<input type="checkbox" style="margin-top:.3rem;margin-left:-1.25rem">');
        $enabled.attr('checked', user.enabled);
        $row.append($('<td class="text-center"></td>').append($enabled));

        let $updateButton = $('<button class="btn btn-sm btn-primary">Update</button>');
        $updateButton.on('click', updateClickHandler);
        $row.append($('<td class="text-center p-1 p-lg-2"></td>').append($updateButton));

        let $deleteButton = $('<button class="btn btn-sm btn-danger">Delete</button>');
        $deleteButton.on('click', deleteClickHandler);
        $row.append($('<td class="text-center p-1 p-lg-2"></td>').append($deleteButton));
    }

    /**
     *
     * @param {number} pages
     * @param {number} colSpan
     * @param {function} navigationCallback
     * @constructor
     */
    function NavigationRow(pages, colSpan, navigationCallback) {
        /**
         *
         * @returns {*|Window.jQuery|HTMLElement}
         */
        this.getRow = function () {
            return $row;
        }

        let navToFirst = function () {
            currentPage = 1;
            updateNav();
        }

        let navLeft = function () {
            currentPage = currentPage < 2 ? 1 : currentPage - 1;
            updateNav();
        }

        let navRight = function () {
            currentPage = currentPage < pages ? currentPage + 1 : pages;
            updateNav();
        }

        let navToLast = function () {
            currentPage = pages;
            updateNav();
        }

        let updateNav = function () {
            $navCol.empty();
            $firstLink.off('click');
            $leftLink.off('click');
            $rightLink.off('click');
            $lastLink.off('click');

            $indexSpan.text(currentPage);

            if (currentPage > 2) {
                $firstLink.on('click', navToFirst);
                $navCol.append($firstLink);
            }

            if (currentPage > 1) {
                $leftLink.on('click', navLeft);
                $navCol.append($leftLink);
            }

            $navCol.append($indexSpan);

            if (pages - currentPage > 0) {
                $rightLink.on('click', navRight);
                $navCol.append($rightLink);
            }

            if (pages - currentPage > 1) {
                $lastLink.on('click', navToLast);
                $navCol.append($lastLink);
            }

            navigationCallback(currentPage);
        }

        const navigationColumns = 5;

        let currentPage = 1;

        let $firstLink = $('<button class="p-2 mx-1 btn btn-outline-primary" id="navFirst"><<</button>');

        let $leftLink = $('<button class="p-2 mx-1 btn btn-outline-primary" id="navLeft"><</button>');

        let $rightLink = $('<button class="p-2 mx-1 btn btn-outline-primary" id="navRight">></button>');

        let $lastLink = $('<button class="p-2 mx-1 btn btn-outline-primary" id="navLast">>></button>');

        let sideColSpan, indexColSpan

        if (colSpan % 2 === 0) {
            sideColSpan = (colSpan - 6) / 2;
            indexColSpan = 2;
        } else {
            sideColSpan = (colSpan - 5) / 2;
            indexColSpan = 1;
        }

        let $row = $('<tr></tr>');

        let $navCol = $('<td colspan="' + colSpan + '"></td>');

        let $indexSpan = $('<span class="text-center px-3">1</span>');

        $navCol.append($indexSpan);

        if (pages > 1) {
            $rightLink.on('click', navRight);
            $navCol.append($rightLink);
        }

        if (pages > 2) {
            $lastLink.on('click', navToLast);
            $navCol.append($lastLink);
        }

        $row.append($navCol);
    }
}