// import React from 'react'
// import ReactDOM from 'react-dom'
// import { Provider, connect } from 'react-redux'
// import { createStore, combineReducers, applyMiddleware } from 'redux'
// import thunk from 'redux-thunk'

// import rootReducer from './redux/reducers'
// import App from './components/App'

// const store = createStore(
//   rootReducer,
//   applyMiddleware(thunk)
// );

// Test app by Norton
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';
const ADD = 'ADD';

const defaultStore = {
       currentValue: 0,
       items: []
};

// ACTION CREATORS
const increment = (value) => {
  return {
    type: INCREMENT,
    value: value + 1
  }
}

const decrement = (value) => {
  return {
    type: DECREMENT,
    value: value - 1
  }
}

const add = (message) => {
  return {
    type: ADD,
    items: message
  }
}

// Redux REDUCER
const reducer = (state = defaultStore, action) => {
  switch (action.type) {
    case INCREMENT:
      return Object.assign({ ...state}, { currentValue: action.value });
    case DECREMENT:
      return Object.assign({ ...state },{ currentValue: action.value });
    case ADD:
      return Object.assign({ ...state },{ items: Object.assign([...state.items, action.items ]) });
    default:
      return state;
  }
}

// Redux STORE
const store = Redux.createStore(reducer);

// STATE TO PROPS
const mapStateToProps = (state) => {
  return {
     currentValue: state.currentValue,
     input: state.input,
     items: [...state.items]
  }
}

// DISPATCH TO PROPS
const mapDispatchToProps = (dispatch) => {
  return {
    submitNewMessage: function(newItem) {
      dispatch(add(newItem));
    },
    
    incrementValue: function(value) {
      dispatch(increment(value));
    },

    decrementValue: function(value) {
      dispatch(decrement(value));
    }
  }
}

// MYAPP (PRESENTATIONAL)
class MyApp extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
         input: ''
     }
     
     this.incrementHandler = this.incrementHandler.bind(this);
     this.decrementHandler = this.decrementHandler.bind(this);
     this.changeHandler = this.changeHandler.bind(this);
     this.addHandler = this.addHandler.bind(this);
   }
   
   incrementHandler(e) {
     this.props.incrementValue(this.props.currentValue);
   }
  
   decrementHandler(e) {
     this.props.decrementValue(this.props.currentValue);
   }
  
   changeHandler(e) {
     this.setState({
       input: e.target.value
     })
   }
  
  
   addHandler(e) {
     this.props.submitNewMessage(this.state.input);
     this.setState({input: ''});
   }
  
   render() {
     return (
       <div>Norton's First React-Redux App<br />{this.props.currentValue} <br />
       <button onClick={this.incrementHandler}>Increment</button>
       <button onClick={this.decrementHandler}>Decrement</button><br />
       <input value={this.state.input} onChange={this.changeHandler} />
       <button onClick={this.addHandler}>Add</button><br /><br />
       <ul>
         {this.props.items.map((item,index) => {
           return <li id={item+index} key={item+index}>{item}</li>
       })}
       </ul>
       </div>
     );
   }
  
}

// REACT-REDUX PROVIDER
const Provider = ReactRedux.Provider;

// CONNECT PRESENTATIONAL TO MAPPINGS
const connect = ReactRedux.connect;
const ConnectedMyApp = connect(mapStateToProps, mapDispatchToProps)(MyApp)


// WRAPPER (PROVIDER with CONNECTED MYAPP)
class AppWrapper extends React.Component {

  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <Provider store={store}>
        <ConnectedMyApp />
      </Provider>
    )
  }
};

// RENDER
ReactDOM.render(
   <AppWrapper />,
   document.getElementById('whatever')
);