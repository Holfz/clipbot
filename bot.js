const fs = require('fs');
const Discord = require("discord.js");

const client = new Discord.Client();
const config = require("./config.json");
const prefix = config.prefix;

client.commands = new Discord.Collection();

fs.readdir("./modules/", (err, files) => {
    if(err) {console.error(err);}

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0) {
        return console.log("Discord > No commands to load!");
    }

    console.log(`Discord > Loading ${jsfiles.length} commands!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./modules/${f}`);
        console.log(`Discord > ${f} loaded!`);
        client.commands.set(props.help.name, props);
    });
});

client.on('ready', () => {
    console.log(`Discord > Logged in as ${client.user.tag}!`);
    client.user.setStatus('available') // Can be 'available', 'idle', 'dnd', or 'invisible'
});

client.on('message', async msg => {
    if(msg.author.bot) {return;}
    if(msg.channel.type === "dm") {return;}

    let msgArray = msg.content.split(/\s+/g);
    let command = msgArray[0];
    let args = msgArray.slice(1);

    if(!command.startsWith(prefix)) {return;}
    
    let cmd = client.commands.get(command.slice(prefix.length))
    if (cmd) {cmd.run(client, msg, args)}
});

client.login(config.token);
