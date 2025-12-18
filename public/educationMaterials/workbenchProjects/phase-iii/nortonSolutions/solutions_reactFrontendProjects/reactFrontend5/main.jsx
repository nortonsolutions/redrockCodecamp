/**
 * PomodoroClock by Norton 2021
 */

const RESET = 'RESET';
const CHANGE = 'CHANGE';

const resetAction = (payload) => ({
    type: RESET,
    payload
})

const changeAction = (payload) => ({
    type: CHANGE,
    payload
})
 
const initialState = {
    breakLength: 5,
    sessionLength: 25,
    running: false,
    timeLeft: 25*100,
    currentTimer: "session",
    justReset: true
}
 
const reducer = (state = initialState, { type, payload }) => {
    switch (type) {
 
    case RESET:
        return { ...state, ...initialState };

    case CHANGE:

        var changes = {};

        // payload is the changeType
        switch (payload) {
            case "break-decrement": 
                if (state.breakLength > 1) changes.breakLength = state.breakLength - 1;
                break;
            case "break-increment": 
                if (state.breakLength < 60) changes.breakLength = state.breakLength + 1;
                break;
            case "session-decrement": 
                if (state.sessionLength > 1) changes.sessionLength = state.sessionLength - 1;
                break;
            case "session-increment": 
                if (state.sessionLength < 60) changes.sessionLength = state.sessionLength + 1;
                break;   
            case "start_stop":

                if (state.justReset) {
                    changes.timeLeft = state.sessionLength*100;
                    changes.justReset = false;
                }

                changes.running = !state.running;
                break;
            case "tick":
                changes.timeLeft = state.timeLeft - 1;
                break;
            case "flipTimers":
                switch (state.currentTimer) {
                    case "session":
                        changes.currentTimer = "break";
                        changes.timeLeft = state.breakLength*100;
                        break;
                    case "break":
                        changes.currentTimer = "session";
                        changes.timeLeft = state.sessionLength*100;
                        break;
                }

        }

        return { ...state, ...changes }

    default:
        return state
    }
}

const store = Redux.createStore(reducer);

const mapStateToProps = (state) => {
    return {
        breakLength: state.breakLength,
        sessionLength: state.sessionLength,
        running: state.running,
        timeLeft: state.timeLeft,
        currentTimer: state.currentTimer
    }
}
    

const mapDispatchToProps = (dispatch) => {
    return {
        reset: function() {
            dispatch(resetAction());
        },

        change: function(changeType) {
            dispatch(changeAction(changeType));
        }
    }
};


// PRESENTATIONAL
class PomodoroClock extends React.Component {
    constructor(params) {
        super(params);
        this.reset = this.reset.bind(this);
        this.change = this.change.bind(this);

    }

    change(e) {

        switch (e.target.id) {
            case "start_stop": 
                if (e.target.innerText =="start") { 
                    e.target.innerText = "stop" 
                } else e.target.innerText = "start";
                break;
            
            case "tick":
                if (this.props.timeLeft <= 0) {
                    document.getElementById('beep').load();
                    document.getElementById('beep').play();
                    this.props.change('flipTimers');
                }
                break;
        }

        this.props.change(e.target.id)
    }

    reset() {
        this.props.reset();
        document.getElementById('start_stop').innerText='start';
        document.getElementById('beep').load();
    }

    seconds(totalTime) {
        return Math.floor(totalTime/100);
    }


    hundredths(totalTime) {
        return (totalTime%100).toLocaleString("en-US", { minimumIntegerDigits: 2 })
    }


    render() {
        return (
            <div className="container-fluid">
                <label id="break-label" className="text-primary" htmlFor="break-length">Break Length {(this.props.running && this.props.currentTimer=="break")?"- active":""}</label>
                <div className="row">
                    <div className="col-1 text-center" id="break-length">{this.props.breakLength}</div>
                    <div onClick={this.change} className="btn-custom btn-sm btn-primary" id="break-decrement">-</div>
                    <div onClick={this.change} className="btn-custom btn-sm btn-primary" id="break-increment">+</div>
                </div>

                <label id="session-label" className="text-primary" htmlFor="session-length">Session Length {(this.props.running && this.props.currentTimer=="session")?"- active":""}</label>
                <div className="row">
                    <div className="col-1 text-center" id="session-length">{this.props.sessionLength}</div>
                    <div onClick={this.change} className="btn-custom btn-sm btn-primary" id="session-decrement">-</div>
                    <div onClick={this.change} className="btn-custom btn-sm btn-primary" id="session-increment">+</div>
                </div>

                <label className="text-primary" htmlFor="time-left" id="timer-label">Session</label>
                <div className="row">
                    <div className="col-1 text-center" id="time-left">{String(this.seconds(this.props.timeLeft) + ":" + this.hundredths(this.props.timeLeft))}</div>
                    <div onClick={this.change} className="btn-custom btn-sm btn-primary" id="start_stop">start</div>
                    <div onClick={this.reset} className="btn-custom btn-sm btn-primary" id="reset">reset</div>
                </div>
                <audio src="https://redrockcode.com/educationMaterials/audio/windowsMedia/Windows%20Foreground.wav" id="beep"></audio>

            </div>
        )
    }

    componentDidMount() {

        document.getElementById('beep').load();
        setInterval(() => {
            if (this.props.running) {
                this.change({ target: { id: 'tick' }});
            }

        }, 10)
    }
}



const PomodoroClockConnnected = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(PomodoroClock);

const Provider = ReactRedux.Provider;

class PomodoroClockWrapped extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Provider store={store}>
                <PomodoroClockConnnected />
            </Provider>
        )
    }
}

ReactDOM.render(
    <PomodoroClockWrapped />,
    document.getElementById('myApp')
)

