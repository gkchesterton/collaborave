#Readme
***
###Collaborave is an online recording/mixing app for music collaboration
I relied heavily on the mixer.js chrome experiment by Kevin Ennis, as well as the Audio Recorder library by Chris Wilson.
##Recording
***
Collaborave uses getUserMedia to obtain a stream from the user's audio hardware. I utilized the web worker from the AudioRecorder library to push the audio data into a float array for encoding once recording was finished. The app then uploads to an ftp server and saves the url in the main database for use later. I only had two weeks to build this, so unfortunately it presently must upload, then re-download the audio. I plan on correcting this, since the buffer is obviously available on the front-end before it is ever sent to the server. A much better user experience could be easily achieved this way since it would cut wait times when using the app nearly exponentially.

##Playback/Mixing
***
The mixing features are simple audio nodes from the web audio api. The controls are presently linear, which is less than natural - another nicety I plan on implementing in the near future. The back-end holds the parameters needed to build filters/nodes dynamically via meta-programming on initializing the objects in backbone. It is ready for any dsp that can be created via the web audio api (well... it may need some tweaking).  It is also ready to receive automations for all of these parameters to allow for more powerful editing of tracks/regions by the user. I hope to get a graphic interface for basic editing in place soon.

##Social
***
This app is intended for collaboration. I'm almost done with versioning and comments/notes and adding collaborator users to each project. It's just about ready, but again I only had two weeks.