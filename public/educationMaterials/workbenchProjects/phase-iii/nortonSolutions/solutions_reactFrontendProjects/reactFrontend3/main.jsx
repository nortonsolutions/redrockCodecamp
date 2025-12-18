/**
 * Drum Machine by Norton 2021
 */

const actionName = payload => ({
  type: type,
  payload
});

const initialState = {};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionName:
      return { ...state, ...payload };

    default:
      return state;
  }
};

// REDUX STORE - for recording features?  Other state?
const store = Redux.createStore(reducer);

// PRESENTATIONAL
class DrumMachine extends React.Component {
  constructor(params) {
    super(params);
    this.playDrum = this.playDrum.bind(this);
  }

  playDrum(e) {
    document.getElementById(e.target.innerText).play();
  }

  render() {
    return (
      <div id="drum-machine">
        <div id="display" className="col ml-5 mt-5">
          <div className="row">
            <div className="drum-pad" onClick={this.playDrum} id="boom">
              Q
              <audio
                className="clip"
                id="Q"
                src="https://redrockcode.com/educationMaterials/audio/boom.wav"
              />
            </div>
            <div className="drum-pad" onClick={this.playDrum} id="clap">
              W
              <audio
                className="clip"
                id="W"
                src="https://redrockcode.com/educationMaterials/audio/clap.wav"
              />
            </div>
            <div className="drum-pad" onClick={this.playDrum} id="hihat">
              E
              <audio
                className="clip"
                id="E"
                src="https://redrockcode.com/educationMaterials/audio/hihat.wav"
              />
            </div>
          </div>
          <div className="row">
            <div className="drum-pad" onClick={this.playDrum} id="kick">
              A
              <audio
                className="clip"
                id="A"
                src="https://redrockcode.com/educationMaterials/audio/kick.wav"
              />
            </div>
            <div className="drum-pad" onClick={this.playDrum} id="openhat">
              S
              <audio
                className="clip"
                id="S"
                src="https://redrockcode.com/educationMaterials/audio/openhat.wav"
              />
            </div>
            <div className="drum-pad" onClick={this.playDrum} id="ride">
              D
              <audio
                className="clip"
                id="D"
                src="https://redrockcode.com/educationMaterials/audio/ride.wav"
              />
            </div>
          </div>
          <div className="row">
            <div className="drum-pad" onClick={this.playDrum} id="snare">
              Z
              <audio
                className="clip"
                id="Z"
                src="https://redrockcode.com/educationMaterials/audio/snare.wav"
              />
            </div>
            <div className="drum-pad" onClick={this.playDrum} id="tink">
              X
              <audio
                className="clip"
                id="X"
                src="https://redrockcode.com/educationMaterials/audio/tink.wav"
              />
            </div>
            <div className="drum-pad" onClick={this.playDrum} id="tom">
              C
              <audio
                className="clip"
                id="C"
                src="https://redrockcode.com/educationMaterials/audio/tom.wav"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
      window.addEventListener('keydown', e => {
          // alert("key pressed: " + e.keyCode + " " + e.key);
          let data = { target: { innerText: e.key.toUpperCase() }}
          this.playDrum(data);
      })
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

const DrumMachineConnnected = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(DrumMachine);

const Provider = ReactRedux.Provider;

class DrumMachineWrapped extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={store}>
        <DrumMachineConnnected />
      </Provider>
    );
  }
}

ReactDOM.render(<DrumMachineWrapped />, document.getElementById("myApp"));
