var localStream = null;
var userName = 'anonymous';
const localVideo = document.getElementById('videomy');
localVideo.autoplay = true;
const roomid = window.location.pathname.slice(1);
let socket = io('/');

//starting video first time
function startVideo() {
  if (localStream != null) {
    localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
    if (localStream.getVideoTracks()[0].enabled) {
      document.getElementById("camerabutton").classList.replace("fa-video", "fa-video-slash");
      document.getElementById("camerabutton2").classList.replace("fa-video", "fa-video-slash");
    }
    else {
      document.getElementById("camerabutton").classList.replace("fa-video-slash", "fa-video");
      document.getElementById("camerabutton2").classList.replace("fa-video-slash", "fa-video");
    }

    return;
  }
  var cam = document.getElementById("camerabutton");
  var cam2 = document.getElementById("camerabutton");

  const mediaStreamConstraints = {

    video: true,
    audio: true,

  };

  function gotLocalMediaStream(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
  }

  function handleLocalMediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

  if (cam.classList.contains("fa-video")) {
    cam.classList.replace("fa-video", "fa-video-slash");
    cam2.classList.replace("fa-video", "fa-video-slash");
  }
  else {
    cam.classList.replace("fa-video-slash", "fa-video");
    cam2.classList.replace("fa-video-slash", "fa-video");
  }

  if (localStream.getAudioTracks()[0].enabled) {
    document.getElementById("micbutton").classList.replace("fa-microphone", "fa-microphone-slash");
  }
  else {
    document.getElementById("micbutton").classList.replace("fa-microphone-slash", "fa-microphone");
  }
}


//starting audio first time
function startAudio() {
  if (localStream == null) {
    const mediaStreamConstraints = {
      video: true,
      audio: true
    };
    
    localVideo.autoplay = true;

    function gotLocalMediaStream(mediaStream) {
      localStream = mediaStream;
      localVideo.srcObject = mediaStream;
    }
    // Handles error by logging a message to the console with the error message.
    function handleLocalMediaStreamError(error) {
      console.log('navigator.getUserMedia error: ', error);
    }

    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
      .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

    var mic = document.getElementById("micbutton");
    var mic2 = document.getElementById("micbutton2");

    if (mic.classList.contains("fa-microphone")) {
      mic.classList.replace("fa-microphone", "fa-microphone-slash");
      mic2.classList.replace("fa-microphone", "fa-microphone-slash");

    }
    else {
      mic.classList.replace("fa-microphone-slash", "fa-microphone");
      mic2.classList.replace("fa-microphone-slash", "fa-microphone");
    }
    if (localStream.getVideoTracks()[0].enabled) {
      document.getElementById("camerabutton").classList.replace("fa-video", "fa-video-slash");
      document.getElementById("camerabutton2").classList.replace("fa-video", "fa-video-slash");
    }
    else {
      document.getElementById("camerabutton").classList.replace("fa-video-slash", "fa-video");
      document.getElementById("camerabutton2").classList.replace("fa-video-slash", "fa-video");
    }
  }
  else {
    localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
    if (localStream.getAudioTracks()[0].enabled) {
      document.getElementById("micbutton").classList.replace("fa-microphone", "fa-microphone-slash");
      document.getElementById("micbutton2").classList.replace("fa-microphone", "fa-microphone-slash");
    }
    else {
      document.getElementById("micbutton").classList.replace("fa-microphone-slash", "fa-microphone");
      document.getElementById("micbutton2").classList.replace("fa-microphone-slash", "fa-microphone");
    }
    return;
  }
}

//turn on/off cam
function toggleVideo() {
  var cam = document.getElementById("camerabutton2");
  if (cam.classList.contains("fa-video")) {
    cam.classList.replace("fa-video", "fa-video-slash");
  }
  else {
    cam.classList.replace("fa-video-slash", "fa-video");
  }
  localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
}
//turn on/off mic
function toggleAudio() {
  var cam = document.getElementById("micbutton2");
  if (cam.classList.contains("fa-microphone")) {
    cam.classList.replace("fa-microphone", "fa-microphone-slash");
  }
  else {
    cam.classList.replace("fa-microphone-slash", "fa-microphone");
  }
  localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
}

//copies invite link to clipboard on clicking
function copy() {
  console.log("copy button click");
  navigator.clipboard.writeText(location.href).then(function () {
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
  document.getElementById("copyBtn").style.background = "lightgray"
}

socket.on('connected', () => {

})

socket.emit('send-roomid', roomid);

function getUserName() {
  userName = document.getElementById('user-name').value;
  document.getElementById('hiUser').innerHTML = "Hi " + userName + "!";
  socket.emit('send-userName', userName);
}

function showSecondPanel() {
  getUserName();
  var firstpanel = document.getElementById("firstPanel");
  firstpanel.style.display = "none";
  var secondpanel = document.getElementById("secondPanel");
  secondpanel.style.visibility = "visible";
  secondpanel.style.display = "block";
}

function searchKeyPress(e) {
  e = e || window.event;
  if (e.keyCode == 13) {
    document.getElementById('sendBtn').click();
    return false;
  }
  return true;
}

function showThirdPanel() {
  var secondpanel = document.getElementById("secondPanel");
  secondpanel.style.display = "none";
  var thirdpanel = document.getElementById("thirdPanel");

  localVideo.setAttribute('class', 'rounded-md border-4 videoItem')

  document.getElementById('videoContainer').appendChild(localVideo);

  var dimensions = getVideoDimension();
  localVideo.style.minHeight = dimensions.minHeight;
  localVideo.style.minWidth = dimensions.minWidth;
  localVideo.style.setProperty("height", dimensions.height);
  localVideo.style.setProperty("width", dimensions.width);
  localVideo.removeAttribute("id", "videomy");

  var pElement = document.createElement('p');
  pElement.setAttribute('id', 'pmy')
  pElement.style.color = 'white';
  pElement.innerText = 'You';

  document.getElementById('videoContainer').appendChild(pElement);
  
  thirdpanel.style.visibility = "visible";
  thirdpanel.style.display = "block";
  Join();

}

function send() {
  const message = document.getElementById('inputMessage').value;
  document.getElementById("inputMessage").value = '';
  var obj = {
    message: message,
    roomid: roomid
  }

  socket.emit('send-message', obj);
  var messageElement = document.createElement('label')
  messageElement.innerHTML = "you : ".bold() + message;
  messageElement.style.maxWidth = "90%";
  var messageContainer = document.getElementById('messageContainer');
  messageContainer.appendChild(messageElement);
}

socket.on('receive-message', obj => {
  console.log(obj.name + ' : ' + obj.message);
  var messageElement = document.createElement('label')
  messageElement.style.background = "rgb(226,232,240)";
  messageElement.innerHTML = (obj.name + ' : ').bold() + obj.message;
  var messageContainer = document.getElementById('messageContainer');
  messageContainer.appendChild(messageElement);
})

socket.on('new-user-joined', newUserName => {
  var messageElement = document.createElement('label')

  messageElement.style.color = "green";
  messageElement.innerHTML = newUserName + " has joined the room.";

  var messageContainer = document.getElementById('messageContainer');
  messageContainer.appendChild(messageElement);
})

socket.on('user-disconnected', obj => {
  var messageElement = document.createElement('label')

  messageElement.style.color = "red";
  messageElement.innerHTML = obj.name + " has left the room.";
  document.getElementById('video' + obj.peerid).remove();
  document.getElementById('p' + obj.peerid).remove();
  var messageContainer = document.getElementById('messageContainer');
  messageContainer.appendChild(messageElement);
})

function Join() {
  var peer = new Peer();
  peer.on('open', function (id) {
    peerId = id;
    socket.emit('send-peerId', peerId);
  });

  socket.on('receive-peerId-and-call', obj => {
    callPeer(obj.otherPeerId, obj.name);
  })

  function callPeer(remoteId, name) {
    var call = peer.call(remoteId,
      localStream);
    appendVideo(remoteId, name);
    let remoteVideo = document.getElementById('video' + remoteId);

    call.on('stream', function (stream) {
      remoteStream = stream;
      remoteVideo.srcObject = stream;
    });

  }

  //answer call
  var callerName = 'guest';
  socket.on('receive-caller-name', name => {
    callerName = name;
  })
  peer.on('call', function (call) {
    call.answer(localStream);

    appendVideo(call.peer, callerName);
    let remoteVideo = document.getElementById('video' + call.peer);
    call.on('stream', function (stream) {
      remoteStream = stream;
      remoteVideo.srcObject = stream;
    });
  });
}
//answer call done

//to change video panel dimensions as new users join (video size shrinks)
function getVideoDimension() {
  {
    let widthMain = document.getElementById("main").offsetWidth;
    let minWidth = "30%"
    if ((widthMain * 30 / 100) < 300) {
      minWidth = "300px"
    }
    let minHeight = "40%"


    var videos = document.getElementsByTagName('video');
    let userCount = videos.length;


    let height = String(100 / userCount) + "%"
    let width = ""
    if (userCount === 0 || userCount === 1) {
      width = "70%"
      //	height = "100%"
    } else if (userCount === 2) {
      width = "45%"
      height = "100%"
    } else if (userCount === 3 || userCount === 4) {
      width = "35%"
      height = "50%"
    } else {
      width = String(100 / userCount) + "%"
    }

    for (let a = 0; a < videos.length; ++a) {
      videos[a].style.minWidth = minWidth
      videos[a].style.minHeight = minHeight
      videos[a].style.setProperty("width", width)
      videos[a].style.setProperty("height", height)
    }

    return { minWidth, minHeight, width, height }
  }

}

//appends video (either our own or peer)
function appendVideo(tagId, name) {
  var videoElement = document.createElement('video');
  videoElement.setAttribute('id', 'video' + tagId);
  videoElement.setAttribute('class', 'rounded-md border-4 videoItem')
  videoElement.autoplay = true;
  document.getElementById('videoContainer').appendChild(videoElement);

  var dimensions = getVideoDimension();
  videoElement.style.minHeight = dimensions.minHeight;
  videoElement.style.minWidth = dimensions.minWidth;
  videoElement.style.setProperty("height", dimensions.height);
  videoElement.style.setProperty("width", dimensions.width);
  
  var pElement = document.createElement('p');
  pElement.setAttribute('id', 'p' + tagId)
  pElement.style.color = 'white';
  pElement.innerText = name;
  document.getElementById('videoContainer').appendChild(pElement);
}

