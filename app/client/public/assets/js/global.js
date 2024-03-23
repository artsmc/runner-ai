const parts = window.location.pathname.split('/');
function validationError(text) {
    Toastify({
        text,
        duration: 3000
    }).showToast();
}
function successToast(text) {
    Toastify({
        text,
        backgroundColor: '#faeabe',
        style: {
            color: "#2d2d2d",
        },
        duration: 3000
    }).showToast();
}

/*global jQuery */
/*!
* FitText.js 1.2
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/


