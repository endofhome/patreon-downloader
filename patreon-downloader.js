const puppeteer = require('puppeteer');
const fs = require('fs');
const exec = require('child_process').exec;

async function loadCookies(page) {
    const cookiesArr = require(`./cookies`);
    if (cookiesArr.length !== 0) {
        for (let cookie of cookiesArr) {
            await page.setCookie(cookie)
        }
        console.log('Session has been loaded in the browser');
    }
}

async function main() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await loadCookies(page);

    console.log("Starting Chromium and looking for new songs to download...");
    await page.goto(`https://www.patreon.com/${process.env.PATREON_ARTIST}/posts`, {timeout: 10000, waitUntil: 'networkidle0'});

    const waitTime = 0.5;

    // lazy load
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
    //

    const songs = await page.evaluate(() => {
        // all executed in the context of the browser

        function postContent(postCard) {
            const postContentCollapsed = postCard.querySelector('[data-tag="post-content-collapse"]');

            function collapsedContent() {
                const containsParagraphs = postContentCollapsed.querySelectorAll('p');

                function arrayOfPostContentCollapsed() {
                    const notesHtmlWithBrTags = postContentCollapsed.firstChild.firstChild.firstChild.firstChild.innerHTML;
                    const splitByBrTag = notesHtmlWithBrTags.split('<br><br>');
                    const result = [];
                    [1, 2].forEach(() => { // duplicating the notes so they match the output of finding by <p> tag
                        splitByBrTag.forEach(note =>
                            result.push({textContent: note})
                        );
                    });
                    return result;
                }

                return containsParagraphs.length !== 0 ? [...containsParagraphs] : arrayOfPostContentCollapsed()
            }

            function uncollapsedContent() {
                const result = [];
                result.push(postCard.querySelector('[data-tag="post-content"]'));
                return result;
            }

            return postContentCollapsed ? collapsedContent() : uncollapsedContent();
        }

        function dateFor(postCard) {
            const textContent = postCard.querySelector('[data-tag="post-published-at"]').textContent;
            try {
                const months = {
                    Jan: '01',
                    Feb: '02',
                    Mar: '03',
                    Apr: '04',
                    May: '05',
                    Jun: '06',
                    Jul: '07',
                    Aug: '08',
                    Sep: '09',
                    Oct: '10',
                    Nov: '11',
                    Dec: '12'
                };

                function commaIsPresentIn(string) {
                    return string.includes(',')
                }

                function padWithZero(string) {
                    if (string.length === 1) {
                        return '0' + string;
                    } else {
                        return string;
                    }
                }

                const timeStripped = textContent.replace(/ at .*/g, '');
                let split = timeStripped.split(" ");
                split[0] = months[split[0]];

                if (commaIsPresentIn(timeStripped)) {
                    const year = split.splice(2, 1);
                    split.unshift(year[0]);
                    split[2] = padWithZero(split[2].replace(',', ''));
                    return split.join('-')
                } else {
                    split.unshift(new Date().getFullYear().toString());
                    split[2] = padWithZero(split[2]);
                    return split.join('-')
                }

            } catch (e) {
                throw Error(`couldn't parse date: ${textContent}`)
            }
        }

        return [...document.querySelectorAll('[data-tag="post-card"]')]
            .filter(postCard => {
                // filter out any posts without files
                return postCard.querySelector('a[data-tag="post-file-download"]') !== null
            }).map(postCard => {
                console.log("processing " + postCard.querySelector('a[data-tag="post-file-download"]').textContent);

                const songNotes = postContent(postCard).map(element => {
                    return element.textContent
                });

                function notes() {
                    if (songNotes.length % 2 === 0) {
                        const firstHalf = [];
                        const secondHalf = [];
                        songNotes.forEach((songNote, index) => {
                            if (index < (songNotes.length / 2)) {
                                firstHalf.push(songNote);
                            } else {
                                secondHalf.push(songNote);
                            }
                        });

                        if (firstHalf.length !== secondHalf.length) {
                            throw Error(`Halves are of unequal length. First half: ${firstHalf.length}, second half: ${secondHalf.length}`)
                        }

                        firstHalf.forEach((note, index) => {
                            if (note !== secondHalf[index]) {

                                throw Error(`Notes are not duplicates. First note: ${note}, second note: ${secondHalf[index]}`)
                            }
                        });

                        return firstHalf;
                    } else {
                        return songNotes;
                    }
                }

                let secondAudioPlayerElement = postCard.querySelectorAll('[aria-label="Audio Player"]')[1];
                let style = secondAudioPlayerElement.firstChild.firstChild.getAttribute('style');
                let date = dateFor(postCard);
                let year = date.split('-')[0];

                const artworkUrl = style.slice(23) // cut first 23 chars
                    .split('')
                    .reverse()
                    .slice(3) // cut last 3 chars
                    .reverse()
                    .join('');

                return {
                    title: postCard.querySelector('[data-tag="post-title"]').textContent,
                    file: postCard.querySelector('a[data-tag="post-file-download"]').textContent,
                    url: postCard.querySelector('a[data-tag="post-file-download"]').href,
                    notes: notes(),
                    tags: postCard.querySelector('[data-tag="post-tags"]').firstChild.querySelector('div:nth-child(2').textContent,
                    artwork: artworkUrl,
                    publishedDate: date,
                    year: year
                }
            });
    });

    // print songs JSON
    // console.log(JSON.stringify(songs));

    // hold chrome open so I can play around
    // await page.waitFor(100000);

    browser.close();

    const downloadedTitles = fs.readFileSync("persistence/downloaded.txt")
                               .toString()
                               .split("\n")
                               .map(line => {
                                   return line.split(",")[1]
                               });

    function download(command) {
        exec(command, (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    }

    function downloadMp3(song) {
        function reformatNotesForShellScript() {
            return song.notes.join('\n').replace(/"/g, '\\"');
        }

        const mp3Command = `sh download-mp3.sh "${song.url}" files/${song.file} "${reformatNotesForShellScript()}\n\n${song.tags}" ${song.year} "${song.title}" "${song.artwork}"`;
        download(mp3Command);
    }

    function downloadWav(song) {
        const wavCommand = `sh download-wav.sh "${song.url}" files/${song.file} "${song.title}"`;
        download(wavCommand)
    }

    songs.map(song => {
        if (downloadedTitles.includes(song.title)) {
            console.log(`Already downloaded ${song.title}`)
        } else {
            if (song.file.endsWith('.mp3')) {
                downloadMp3(song);
            } else if (song.file.endsWith('.wav')) {
                downloadWav(song);
            } else {
                throw {
                    message: `Song file is neither mp3 not wav.`,
                    song: song
                }
            }
        }
    });
}

main();
