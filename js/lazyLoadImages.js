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
    // (height * 8) is a bit sloppy - I need to spend some time to find a better solution.
    while (viewportIncr + viewportHeight < height * 8) {
        await page.evaluate(_viewportHeight => {
            // scroll by half of the viewport at a time
            window.scrollBy(0, _viewportHeight / 2);

            const buttons = [...document.querySelectorAll('button')];
            const loadMoreButton = buttons.find(button => {
                const loadMoreDiv = [...button.querySelectorAll('div')].find(div => {
                    return div.textContent === 'Load more'
                });
                if (loadMoreDiv !== undefined) {
                    return button;
                }
            });
            if (loadMoreButton !== undefined) {
                loadMoreButton.click();
            }
        }, viewportHeight);
        await wait(waitTime * 1000);
        viewportIncr = viewportIncr + viewportHeight;
    }
};
