import React from "react";

class VideoChat extends React.Component {

  state = {
    source: ""
  }

  componentDidMount(){
    let displayMediaOptions = {
        video: {
          cursor: "always",
        },
        audio: false,
      };

      navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        .then(this.handleVideo)
        .catch(this.videoError)

    // navigator.mediaDevices.getUserMedia({video: true, audio: false})
    //   .then(this.handleVideo)
    //   .catch(this.videoError)
  }

  handleVideo = (stream) => {
    let videoElem = document.getElementById("video-chat");
    videoElem.srcObject = stream
    this.setState({
      source: stream
    })
  }

  videoError = (err) => {
    alert(err.name)
  }



  render() {
    return (
      <video id="video-chat" src={this.state.source} autoPlay playsInline>
      </video>
    )
  }
}
export default VideoChat