function siteWideStartup() {
    const $leftBar = $('#leftBar');
    const $overlay = $('.overlay');

    $leftBar.mCustomScrollbar({
        theme: "minimal"
    });

    $overlay.on('click', function () {
        $leftBar.removeClass('active');
        $overlay.removeClass('active');
    });

    $('#leftBar-collapse').on('click', function () {
        $leftBar.toggleClass('active');
        $overlay.toggleClass('active');
        $('.collapse.in').toggleClass('in');
    });

    $.ajax({
        url: `${ajaxHost}/blog/post/headers/newest`,
        type: 'get',
        success: function (data) {
            $('#leftBar-content').append($(data).find('.left-bar-li'));
        }
    })
}

let getCsrf = function () {
    return {token: $('meta[name="_csrf"]').attr('content'), header: $('meta[name="_csrf_header"]').attr('content')}
}
