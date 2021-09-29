const express = require('express');
const path = require('path');
const utils = require('./utils');
const { textToSpeech } = require('./azure-cognitiveservices-speech');
const cors = require("cors");

// fn to create express server
const create = async () => {

    // server
    const app = express();
    app.use(cors())
    app.use(utils.ignoreFavicon);
    
    // Log request
    app.use(utils.appLogger);

    // root route - serve static file
    app.get('/', (req, res) => {
        return res.sendFile(path.join(__dirname, './public/client.html'));
    });

    // creates a temp file on server, the streams to client
    /* eslint-disable no-unused-vars */
    app.get('/text-to-speech', async (req, res, next) => {
        try{
            const { key, region, phrase, file, voice, dot_break, comma_break, rate } = req.query;
            if (!key || !region || !phrase || !dot_break || !comma_break || !rate) return res.status(404).send('Invalid query string');
            let fileName = null;
            
            // stream from file or memory
            if (file && file === true) {
                fileName = `./temp/stream-from-file-${timeStamp()}.mp3`;
            }
            
            const audioStream = await textToSpeech(key, region, phrase, fileName, voice, dot_break, comma_break, rate);
            res.set({
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked'
            });
            audioStream.pipe(res);
        }
        catch(err){
            console.log(err);
        }
    });

    app.use(express.static("./public"))

    // Catch errors
    app.use(utils.logErrors);
    app.use(utils.clientErrorHandler);
    app.use(utils.errorHandler);

    return app;
};

module.exports = {
    create
};
