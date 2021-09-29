// azure-cognitiveservices-speech.js

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { Buffer } = require('buffer');
const { PassThrough } = require('stream');
const fs = require('fs');

/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} key your resource key
 * @param {*} region your resource region
 * @param {*} text text to convert to audio/speech
 * @param {*} filename optional - best for long text - temp file for converted speech/audio
 */
const textToSpeech = async (key, region, text, filename, voice, dot_break, comma_break, rate)=> {
    // convert callback function to promise
    return new Promise((resolve, reject) => {
        
        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        speechConfig.speechSynthesisVoiceName = voice;
        let audioConfig = null;

        const modifiedText = text.replace(/\,/g, `<break time="${comma_break}" />`)
        .replace(/\./g, `<break time="${dot_break}" />`);

        const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
            <voice name="${voice}">
                <prosody rate="${rate}" volume="100">
                    ${modifiedText}
                </prosody>
            </voice>
        </speak>
        `;
        
        if (filename) {
            audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
        }
        
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizer.speakSsmlAsync(ssml, result => {
            const { audioData  } = result;
            synthesizer.close();
            if(filename){
                const audioFile = fs.createReadStream(filename);
                resolve(audioFile);
            }
            else{
                const bufferStream = new PassThrough();
                bufferStream.end(Buffer.from(audioData));
                resolve(bufferStream);
            }
        }, error => {
            console.log(error);
            synthesizer.close();
            reject(error);
        })
        // synthesizer.speakTextAsync(
        //     text,
        //     result => {
        //         const { audioData } = result;
        //         synthesizer.close();
        //         if (filename) {
        //             // return stream from file
        //             const audioFile = fs.createReadStream(filename);
        //             resolve(audioFile);
        //         } else {
        //             // return stream from memory
        //             const bufferStream = new PassThrough();
        //             bufferStream.end(Buffer.from(audioData));
        //             resolve(bufferStream);
        //         }
        //     },
        //     error => {
        //         console.log(error)
        //         synthesizer.close();
        //         reject(error);
        //     }); 
    });
};

module.exports = {
    textToSpeech
};