/**
 * JavascriptCalculator by Norton 2021
 */



// OPERATORS
const ADD = '+';
const SUBTRACT = '-';
const MULTIPY = '*';
const DIVIDE = '/';

// ACTIONS
const CLEAR = 'CLEAR';
const SETOPERATOR = 'SETOPERATOR';
const CALCULATE = 'CALCULATE';
const APPEND = 'APPEND';

const initialState = {
    displayValue: '0',
    storedValue: '',
    lastStoredValue: '',
    operator: '',
    readyForNewNumber: true,
    lastAction: CLEAR
}

const actionClear = () => ({
    type: CLEAR,
    payload: initialState
})

const actionSetOperator = (payload) => ({
    type: SETOPERATOR,
    payload: payload
})

const actionCalculate = (payload) => ({
    type: CALCULATE,
    payload: payload
})

const actionAppend = (payload) => ({
    type: APPEND,
    payload: payload
})


const reducer = (state = initialState, { type, payload }) => {
    switch (type) {
 
    case CLEAR:
        return { ...state,...payload };
 
    case SETOPERATOR:

        return { ...state, 
            operator: payload,
            lastStoredValue: state.storedValue,
            storedValue: state.displayValue,
            readyForNewNumber: true,
            lastAction: SETOPERATOR
        }

    case APPEND:

        if (state.displayValue.includes('.') && payload == '.') return state; 
        if (state.displayValue.slice(0,1) == '0' && payload == '0') return state; 

        if (state.readyForNewNumber) {
            return { ...state,
                displayValue: payload,
                readyForNewNumber: false,
                lastAction: APPEND
            }
        } else {
            return { ...state,
                displayValue: state.displayValue += payload,
                lastAction: APPEND
            }
        }

    case CALCULATE:
        if (state.operator != '') {

            var newTotal;
            
            switch (state.operator) {
                case ADD: newTotal = Number(state.storedValue) + Number(payload); break;
                case SUBTRACT: newTotal = Number(state.storedValue) - Number(payload); break;
                case MULTIPY: newTotal = Number(state.storedValue) * Number(payload); break;
                case DIVIDE: newTotal = Number(state.storedValue) / Number(payload); break;
            }

            return { ...state,
                displayValue: String(newTotal),
                lastStoredValue: state.storedValue,
                storedValue: String(newTotal),
                operator: '',
                lastAction: CALCULATE
            }

        } else {
            return state;
        }

    default:
        return state
    }
}

const store = Redux.createStore(reducer);

const mapStateToProps = (state) => {
    return {
        displayValue: state.displayValue,
        lastStoredValue: state.lastStoredValue,
        storedValue: state.storedValue,
        operator: state.operator,
        lastAction: state.lastAction
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        clear: function() {
            dispatch(actionClear());
        },
        
        setOperator: function(operator) {
            dispatch(actionSetOperator(operator));
        },

        calculate: function(displayValue) {
            dispatch(actionCalculate(displayValue));
        },

        append: function(displayValue) {
            dispatch(actionAppend(displayValue));
        }
    }
};


// PRESENTATIONAL
class JavascriptCalculator extends React.Component {
    constructor(params) {
        super(params);

        this.append = this.append.bind(this);
        this.setOperator = this.setOperator.bind(this);
        this.calculate = this.calculate.bind(this);
        this.numberEntered = false;

    }
  
    calculate() {
        this.props.calculate(this.props.displayValue);
    }

    setOperator(e) {
        
        if (this.props.lastAction != SETOPERATOR) {
            if (this.props.storedValue != '' && this.props.operator != '') this.props.calculate(this.props.displayValue);
        }
        this.props.setOperator(e.target.innerText);
    }

    append(e) {
        this.props.append(e.target.innerText);
    }

    render() {
        return (
      <div id="drum-machine" style={{width: 300}}>
        <div className="col mt-5 container">
          <div className="row topRow">
            <div className="display col-9" id="display">
              {this.props.displayValue}
            </div>
            <div onClick={this.props.clear} className="key-pad-clear col-2" id="clear">
              c
            </div>
          </div>


          <div className="row">
            <div onClick={this.append} className="key-pad col-3" id="seven">
              7
            </div>
            <div onClick={this.append} className="key-pad col-3" id="eight">
              8
            </div>
            <div onClick={this.append} className="key-pad col-3" id="nine">
              9
            </div>
            <div onClick={this.setOperator} className="key-pad col-3" id="add">
              +  
            </div>
          </div>
          <div className="row">
            <div onClick={this.append} className="key-pad col-3" id="four">
              4
            </div>
            <div onClick={this.append} className="key-pad col-3" id="five">
              5
            </div>
            <div onClick={this.append} className="key-pad col-3" id="six">
              6
            </div>
            <div onClick={this.setOperator} className="key-pad col-3" id="subtract">
              -  
            </div>
          </div>
          <div className="row">
            <div onClick={this.append} className="key-pad col-3" id="one">
              1
            </div>
            <div onClick={this.append} className="key-pad col-3" id="two">
              2
            </div>
            <div onClick={this.append} className="key-pad col-3" id="three">
              3
            </div>
            <div onClick={this.setOperator} className="key-pad col-3" id="multiply">
              *  
            </div>
          </div>
          <div className="row">
            <div onClick={this.append} className="key-pad col-3" id="zero">
              0
            </div>
            <div onClick={this.append} className="key-pad col-3" id="decimal">
              .
            </div>
            <div onClick={this.calculate} className="key-pad col-3" id="equals">
              =
            </div>
            <div onClick={this.setOperator} className="key-pad col-3" id="divide">
              /  
            </div>
          </div>
        </div>
      </div>
        )
    }
}



const JavascriptCalculatorConnnected = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(JavascriptCalculator);

const Provider = ReactRedux.Provider;

class JavascriptCalculatorWrapped extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Provider store={store}>
                <JavascriptCalculatorConnnected />
            </Provider>
        )
    }
}

ReactDOM.render(
    <JavascriptCalculatorWrapped />,
    document.getElementById('myApp')
)