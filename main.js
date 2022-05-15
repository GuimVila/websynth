window.onload = () => {
    const ctx = new (window.AudioContext || new window.webkitAudioContext)(); 

    //audiobuffers -> to store audio in a way that JS can understand. 
    //represents a certain duration of a sound
    //at any moment during that sound it has stored the amplitude value  of the signal
    //CPU's can only process/handle 1bit of data at a given moment
    //when using with audio in a computer, we use descrete signals
    //splits a continuous signal into a sequence of samples, each of them 
    //representing the amplitude of the signal at that particular moment in time
    //the audio buffer is initialized using a  specific sample rate (n. samples per second);
    
    const buffer = ctx.createBuffer(
        1,//n. of channels. 1= mono 2= stereo 6=5.1 surround
        ctx.sampleRate * 1, //n. of samples in the entire buffer. 
        // multiply sample rate by the number of seconds in our sample
        // to get the complete number of samples
        ctx.sampleRate 
        // this is a mono buffer that holds one second worth of audio data. 
    );
    
    // Read the data inside the buffer
    const channelData = buffer.getChannelData(0); 
    // console.log(channelData.length); 
    
    //Create white noise
    for (let i= 0; i < buffer.length; i++) {
        channelData[i] = Math.random() *  2 -1; //assign a random value between -1 and 1; 
    } //duplicate for a stereo source. 
    
    
    //a buffer source is an audio node that takes our buffer
    // and handles playing it for us. 
    
  
    const primaryGainControl = ctx.createGain(); 
    primaryGainControl.gain.setValueAtTime(0.05, 0); //set the value of the gain node at a 
    //specific time during the audio context existance.  
    // less than 1 decreases the volume. More than 1, increases the volume. 
    primaryGainControl.connect(ctx.destination); 
    
    const button = document.createElement('button'); 
    button.innerText = "White Noise"; 
    button.addEventListener("click", () => {
        const whiteNoiseSource = ctx.createBufferSource(); 
        whiteNoiseSource.buffer = buffer; //asign the buffer of the source to our white noise buffer
        //now we can connect this audio node to any other audio node. 
        whiteNoiseSource.connect(primaryGainControl); 
        whiteNoiseSource.start(); 
    }); 
    document.body.appendChild(button);    

    const snareFilter = ctx.createBiquadFilter(); 
    snareFilter.type = "highpass"; 
    snareFilter.frequency.value = 1500; 
    snareFilter.connect(primaryGainControl); 

    const snareButton = document.createElement("button"); 
    snareButton.innerText = "Snare"; 
    snareButton.addEventListener("click", () => {
        const whiteNoiseSource = ctx.createBufferSource(); 
        whiteNoiseSource.buffer = buffer;
        
        const whiteNoiseGain = ctx.createGain(); 
        whiteNoiseGain.gain.setValueAtTime(1, ctx.currentTime);
        whiteNoiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        whiteNoiseSource.connect(whiteNoiseGain); 
        whiteNoiseGain.connect(snareFilter); 

        whiteNoiseSource.start(); 
        whiteNoiseSource.stop(ctx.currentTime + 0.2); 

        const snareOscillator = ctx.createOscillator(); 
        snareOscillator.type = "triangle"; 
        snareOscillator.frequency.setValueAtTime(230, ctx.currentTime); 

        const oscillatorGain = ctx.createGain(); 
        oscillatorGain.gain.setValueAtTime(1, ctx.currentTime); 
        oscillatorGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        snareOscillator.connect(oscillatorGain); 
        oscillatorGain.connect(primaryGainControl); 
        snareOscillator.start();
        snareOscillator.stop(ctx.currentTime + 0.2); 
    }); 

    document.body.appendChild(snareButton);   

    const kickButton = document.createElement("button"); 
    kickButton.innerText = "Kick"; 
    kickButton.addEventListener("click", () => {
        const kickOscillator =  ctx.createOscillator(); 
        // kickOscillator.type = "square"; 

        kickOscillator.frequency.setValueAtTime(150,0); 
        //go down from 150 to 0.001hz in 0.5sec
        kickOscillator.frequency.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); 

        const kickGain = ctx.createGain(); 
        kickGain.gain.setValueAtTime(2, 0); 
        kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime  + 0.5); 

        kickOscillator.connect(kickGain); 
        kickGain.connect(primaryGainControl); 
        kickOscillator.start(); 
        kickOscillator.stop(ctx.currentTime + 0.5); 
    }); 

    document.body.appendChild(kickButton);  

    // sounds from: https://unpkg.com/browse/@teropa/drumkit@1.1.0/src/assets/

    const HIHAT_URL = "https://unpkg.com/@teropa/drumkit@1.1.0/src/assets/hatOpen2.mp3"; 

    const hiHatButton = document.createElement('button'); 
    hiHatButton.innerText = "Hi Hat";  
    hiHatButton.addEventListener("click", async () => {
        //fetch returns a promise object. We can use .then or: 
        const response = await fetch (HIHAT_URL); 
        const soundBuffer = await response.arrayBuffer(); 
        const hihatBuffer = await ctx.decodeAudioData(soundBuffer);  
        
        const hiHatSource = ctx.createBufferSource(); 
        hiHatSource.buffer = hihatBuffer; 
        hiHatSource.playbackRate.setValueAtTime(2, 0); 

        hiHatSource.connect(primaryGainControl); 
        hiHatSource.start(); 
    }); 
    document.body.appendChild(hiHatButton); 
    
    const NOTES = [
        {name: 'c-4', frequency: 261.626}, 
        {name: 'c#-4', frequency: 277.183}, 
        {name: 'd-4', frequency: 293.665}, 
        {name: 'd#-4', frequency: 311.127}, 
        {name: 'e-4', frequency: 329.628},
        {name: 'f-4', frequency: 349.228},
        {name: 'f#-4', frequency: 369.994},
        {name: 'g-4', frequency: 391.995},
        {name: 'g#-4', frequency: 415.305},
        {name: 'a-4', frequency: 440},
        {name: 'a#-4', frequency: 466.164},
        {name: 'b-4', frequency: 493.883},
        {name: 'c-5', frequency: 523.251},
        {name: 'c#-5', frequency: 554.365}, 
        {name: 'd-5', frequency: 587.33}, 
        {name: 'd#-5', frequency: 622.254}, 
        {name: 'e-5', frequency: 659.255},
        {name: 'f-5', frequency: 698.456},
        {name: 'f#-5', frequency: 739.989},
        {name: 'g-5', frequency: 783.991},
        {name: 'g#-5', frequency: 830.609},
        {name: 'a-5', frequency: 880},
        {name: 'a#-5', frequency: 932.328},
        {name: 'b-5', frequency: 987.767},
        {name: 'c-6', frequency: 1046.502} 
    ];

    const WAVEFORMS = [
        'sine', 
        'square', 
        'sawtooth', 
        'triangle'
    ];

    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(document.createElement('br'));

    NOTES.forEach(({name, frequency}) => {
        const noteButton = document.createElement('button');
        noteButton.innerText = name; 
        noteButton.addEventListener("click", () => {
            const noteOscillator = ctx.createOscillator(); 
            noteOscillator.type = "square"; 
            noteOscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            const vibrato = ctx.createOscillator(); 
            vibrato.frequency.setValueAtTime(10, 0);
            const vibratoGain = ctx.createGain();
            vibratoGain.gain.setValueAtTime(1.5, 0);
            vibrato.connect(vibratoGain);
            vibrato.connect(noteOscillator.frequency);
            vibrato.start();

            //complete sound = 1sec long
            //attack and decay 2, release 3
            //so the sustain time is 3 seconds 
            const attackTime = 0.2; 
            const decayTime = 0.3; 
            const sustainLevel = 0.7; 
            const releaseTime = 0.2; 

            const now = ctx.currentTime; 
            const noteGain = ctx.createGain();
            noteGain.gain.setValueAtTime(0, 0); 
            noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
            noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
            noteGain.gain.linearRampToValueAtTime(sustainLevel, now + 1 - releaseTime);
            noteGain.gain.linearRampToValueAtTime(0, now + 1);

            noteOscillator.connect(noteGain); 
            noteGain.connect(primaryGainControl); 
            noteOscillator.start();
            noteOscillator.stop(ctx.currentTime + 1);
        });  
        document.body.appendChild(noteButton);
    }) 
};  

//we can play a source node only once, since the web audio API doesn't want any memory leaks. 
// we need to create the buffer source inside the button. 
