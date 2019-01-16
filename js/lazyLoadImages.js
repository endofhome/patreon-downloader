module.exports = async function getLazyLoadedImages(page, waitTime) {
    // Scroll one viewport at a time, pausing to let content load
    // based on https://gist.github.com/schnerd/b550b7c05d4a57d8374082aaae714881 by schnerd
    function wait(ms) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }

    const bodyHandle = await page.$('body');
    const {height} = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    const viewportHeight = page.viewport().height;
    let viewportIncr = 0;
    while (viewportIncr + viewportHeight < height) {
        await page.evaluate(_viewportHeight => {
            window.scrollBy(0, _viewportHeight);
        }, viewportHeight);
        await wait(waitTime * 1000);
        viewportIncr = viewportIncr + viewportHeight;
    }
};