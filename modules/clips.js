//Cheeriooooooooooooooooooooooooooooooo

//class="player-video" > video src
//https://clips.twitch.tv/embed?clip={0}&tt_medium=clips_api&tt_content=embed

const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');

//let clipsID = "FairDistinctStarlingRickroll"

var download = function(uri, filename, callback){ // https://stackoverflow.com/a/12751657
    //console.log("url:", uri)
    request.head(uri, function(err, res, body){
        //console.log('content-type:', res.headers['content-type']);
        //console.log('content-length:', res.headers['content-length']);
    
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function getFilesizeInBytes(filename) { //https://techoverflow.net/2012/09/16/how-to-get-filesize-in-node-js/
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}

module.exports.run = async (client, message, args) => {
    if(args[0] === undefined || args[0] === "") {
        return;
    }

    let clipsID = args[0];

    message.channel.send("Please Wait.").then((msg)=>{ //Send ack to client
        Leechit(client, msg, message, clipsID); //Then LEECH IT 
    })
}

function Leechit(client, waitmessage, message, clipsID) {
    (async () => {
        const browser = await puppeteer.launch(); // Spawn the little cute puppeteer
        const page = await browser.newPage(); // For some reason they need to create some page
        
        await page.goto('https://clips.twitch.tv/embed?clip=' + clipsID, {waitUntil: 'networkidle2'}); // Goto target link
        let Qualities = await page.evaluate('player.getQualities()'); // Get all Quality first
    
        if(Qualities.length <= 0) { //If Qualities is empty. Then this link is bad
            return waitmessage.edit('Your link is bad. Or the bot is blacklisted by twitch somehow...'); // Return it god damn it
        }
    
        let BestQualities = Qualities[Qualities.length - 1]; // Then select the BESTEST Quality
        let sauce = BestQualities.source // There you go your SAUCE
        await browser.close(); // Close the browser to save server performance
        

        //Send to our little request download functions
        download(sauce, './tempvideo/' + clipsID + '.mp4', function(){

            // Dealing with discord file size limitation (8 MB maximum)
            if (getFilesizeInBytes('./tempvideo/' + clipsID + '.mp4') > 8000000) { // If file size more than 8000000 byte
                fs.unlinkSync('./tempvideo/' + clipsID + '.mp4'); // Delete file
                return waitmessage.edit('File is too powerful! Here is your direct link : ' + sauce); // Send link instead
            } else { // if not
                waitmessage.delete();

                message.channel.send("Clips : " + clipsID, { // Send a lovely clips
                    files: [
                        './tempvideo/' + clipsID + '.mp4'
                    ]
                }).then(()=> {
                    fs.unlinkSync('./tempvideo/' + clipsID + '.mp4'); // Delete file
                })

                return;
            }

        });
    
    })();
}

module.exports.help = {
    name: "clips"
}