module.exports = async function loadCookies(page) {
    const cookiesArr = require(`../cookies`);
    if (cookiesArr.length !== 0) {
        await cookiesArr.forEach(cookie => {
            page.setCookie(cookie)
        });
        console.log('Session has been loaded in the browser');
    }
};