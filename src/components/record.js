import React, { Component } from "react";
import { GlobalHotKeys } from "react-hotkeys";
import { Button, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import "../styles/record.css";

class Record extends Component {
  constructor(props) {
    super(props);
    this.handleDataAvailable = this.handleDataAvailable.bind(this);
    this.download = this.download.bind(this);
    this.initialize = this.initialize.bind(this);
    this.startCapture = this.startCapture.bind(this);
    this.record = this.record.bind(this);
    this.clip = this.clip.bind(this);
    this.stopRecording = this.stopRecording.bind(this);

    this.state = {
      recording: false,
      modalVisible: true,

      source: null,
      mediastream: null,
      mediarecorder: [],
      interval_id: null,
      keyMap: {
        START_RECORD: "shift+<",
        CLIP: "shift+?",
        STOP_RECORD: "shift+>",
      },
      handlers: {
        START_RECORD: () => {
          console.log("Started!");
          this.initialize();
        },
        CLIP: () => {
          console.log("Clip!");
          this.clip();
        },
        STOP_RECORD: () => {
          console.log("Stopped!");
          this.stopRecording();
        },
      },
    };
  }

  handleDataAvailable(event) {
    let firstmr = this.state.mediarecorder[0];
    firstmr.ondataavailable = null;

    console.log("data-available");
    let recordedChunks = [];

    // console.log(event);

    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      this.download(recordedChunks);
    } else {
      // ...
    }
  }

  download(recordedChunks) {
    var blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "test.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  initialize() {
    let displayMediaOptions = {
      video: {
        frameRate: 120,
        // height: 512,
        // width: 512,
        cursor: "always",
      },
      audio: false,
    };

    this.startCapture(displayMediaOptions);
  }

  startCapture(displayMediaOptions) {
    navigator.mediaDevices
      .getDisplayMedia(displayMediaOptions)
      .then((stream) => {
        let videoElem = document.getElementById("video-chat");
        videoElem.srcObject = stream;

        this.setState({
          source: stream,
          mediastream: stream,
          recording: true,
        });

        videoElem.srcObject = stream;
        this.record(stream);
      })
      .catch((err) => {
        console.error("Error:" + err);
        return null;
      });
  }

  record(stream) {
    var options = { mimeType: "video/webm; codecs=vp9" };
    let that = this;

    let id = setInterval(function () {
      // console.log(that.state.mediarecorder);

      let mediarecorder = new MediaRecorder(stream, options);
      mediarecorder.ondataavailable = null;
      mediarecorder.start();

      let joined = that.state.mediarecorder.concat(mediarecorder);
      if (joined.length > 6) {
        let firstRecorder = joined.shift();
        firstRecorder.stop();
      }
      that.setState({
        mediarecorder: joined,
      });
    }, 2000);

    this.setState({
      interval_id: id,
    });
  }

  clip() {
    let mediarecorder = this.state.mediarecorder[0];
    mediarecorder.ondataavailable = this.handleDataAvailable;
    mediarecorder.requestData();
  }

  stopRecording() {
    let mediarecorder = this.state.mediarecorder;
    let mediastream = this.state.mediastream;
    let tracks = mediastream.getTracks();
    let videoElem = document.getElementById("video-chat");

    videoElem.srcObject = null;
    clearInterval(this.state.interval_id);
    mediarecorder.forEach((mr) => mr.stop());
    tracks.forEach((track) => track.stop());

    this.setState({
      recording: false,
      source: null,
      mediastream: null,
      mediarecorder: [],
    });
  }

  render() {
    return (
      <div className="mainContainer">
        <Modal
          show={this.state.modalVisible}
          backdrop="static"
          // centered
          dialogClassName="modal-90w"
          onHide={() => {
            this.setState({
              modalVisible: false,
            });
          }}
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title
              style={{ paddingLeft: 20, paddingTop: 5, paddingBottom: 5 }}
            >
              Welcome to Clipt!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="keyContainer">
              <div>
                <p>⇧ Shift</p> {" + "} <p>{"<"}</p>
              </div>
              <div>Start Recording</div>
            </div>
            <div className="keyContainer">
              <div>
                <p>⇧ Shift</p> {" + "} <p>{">"}</p>
              </div>
              <div>Stop Recording</div>
            </div>
            <div className="keyContainer">
              <div>
                <p>⇧ Shift</p> {" + "} <p>{"?"}</p>
              </div>
              <div>Clip Last 10 Seconds</div>
            </div>
            <div className="otherText">
              After you start recording, use the clip command to clip and
              download your last 10 seconds of gameplay! Clips are saved as webm
              files - drag and drop them into your browser to play them, or
              convert them to mp4 for easy storage!
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({
                  modalVisible: false,
                });
              }}
              style={{ marginRight: 20, paddingLeft: 25, paddingRight: 25 }}
            >
              Got it!
            </Button>
          </Modal.Footer>
        </Modal>

        <GlobalHotKeys
          keyMap={this.state.keyMap}
          handlers={this.state.handlers}
        />

        <h1
          class="title"
          onClick={() => {
            this.setState({
              modalVisible: true,
            });
          }}
        >
          Clipt
        </h1>

        <div
          class="videoContainer"
          onClick={() => {
            this.setState({
              modalVisible: true,
            });
          }}
        >
          <video id="video-chat" src={this.state.source} autoPlay playsInline />
          <div
            class="overlay"
            style={{ display: this.state.recording ? "none" : "" }}
          >
            <h3>
              <p>⇧ Shift</p> {" + "} <p>{"<"}</p>
            </h3>
            <h3>Start Recording</h3>
          </div>
        </div>

        <div className="diagonal-box-2" />
        <div className="diagonal-box" />

        <div className="helpBar">
          <OverlayTrigger
            key={1}
            placement={"top"}
            overlay={
              <Tooltip id={`tooltip-left`}>{"Shortcut: shift + <"}</Tooltip>
            }
          >
            <button
              disabled={this.state.recording}
              className={this.state.recording ? "disabledButton" : "mainButton"}
              onClick={this.initialize}
            >
              <h2>▶</h2> <h6 className="buttonText">Start Recording</h6>
            </button>
          </OverlayTrigger>
          <OverlayTrigger
            key={2}
            placement={"top"}
            overlay={
              <Tooltip id={`tooltip-mid`}>{"Shortcut: shift + >"}</Tooltip>
            }
          >
            <button
              disabled={!this.state.recording}
              onClick={this.stopRecording}
              className={
                !this.state.recording ? "disabledButton" : "mainButton"
              }
            >
              <h2>■</h2> <h6 className="buttonText">Stop Recording</h6>
            </button>
          </OverlayTrigger>
          <OverlayTrigger
            key={3}
            placement={"top"}
            overlay={
              <Tooltip id={`tooltip-left`}>{"Shortcut: shift + ?"}</Tooltip>
            }
          >
            <Button
              variant="warning"
              disabled={!this.state.recording}
              onClick={this.clip}
              style={{ width: "30%", padding: 20, fontSize: 20 }}
            >
              <h2>✓</h2>{" "}
              <h6 className="buttonText" style={{ color: "black" }}>
                Clip
              </h6>
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    );
  }
}

export default Record;
