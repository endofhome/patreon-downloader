const fs = require('fs');
const exec = require('child_process').exec;

module.exports = function downloadTagAndOrganiseFiles(songs) {
    const downloadedTitles = fs.readFileSync("persistence/downloaded.txt")
        .toString()
        .split("\n")
        .map(line => {
            return line.split(",")[1]
        });

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

    function downloadMp3(song) {
        function reformatNotesForShellScript() {
            return song.notes.join('\n').replace(/"/g, '\\"');
        }

        const mp3Command = `./bin/download-mp3.sh "${song.url}" files/${song.file} "${reformatNotesForShellScript()}\n\n${song.tags}" ${song.year} "${song.title}" "${song.artwork}"`;
        download(mp3Command);
    }

    function downloadWav(song) {
        const wavCommand = `./bin/download-wav.sh "${song.url}" files/${song.file} "${song.title}"`;
        download(wavCommand)
    }

    function download(command) {
        exec(command, (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    }
}