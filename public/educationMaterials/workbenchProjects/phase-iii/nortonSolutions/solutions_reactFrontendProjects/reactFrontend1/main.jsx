const defaultState = {
    
    currentIndex: 0,
    quotes: [
        { text: "What comes around goes around.", author: "Unknown" },
        { text: "Never be first, try to be second.", author: "Fermi" },
        { text: "Imagination is more important than knowledge", author: "Einstein" },
        { text: "Be excellent to each other.", author: "Bill and Ted" },
        { text: "There are only two kinds of people.", author: "One kind" },
        { text: "Whatever.", author: "Whatever" },
        { text: "Yo.", author: "Unknown" }

    ]
}

const SELECTQUOTE = 'SELECTQUOTE';
const ADDQUOTE = 'ADDQUOTE';

// ACTION CREATORS
const selectQuote = () => {
    return {
        type: SELECTQUOTE
    }
}

const addQuote = (quote) => {
    return {
        type: ADDQUOTE,
        quote: quote
    }
}

// REDUCER 
const reducer = (state = defaultState, action) => {
    switch (action.type) {

        case SELECTQUOTE:
            let index = Math.floor(Math.random()*state.quotes.length);
            return Object.assign({ ...state }, { currentIndex: index });

        case ADDQUOTE:
            return Object.assign({ ...state}, 
                { 
                    quotes: [...state.quotes, action.quote]
                })

        default:
            return state;

    }

}

const store = Redux.createStore(reducer);

const mapStateToProps = (state) => {
    return {
        currentIndex: state.currentIndex,
        quotes: state.quotes
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        selectQuote: function() {
            dispatch(selectQuote());
        },

        addQuote: function(quote) {
            dispatch(addQuote(quote));
        }
    }
}


class RandomQuoteMachine extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            inputQuote: '',
            inputAuthor: ''
        }
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.selectRandomQuote = this.selectRandomQuote.bind(this);
        this.handleAuthorInputChange = this.handleAuthorInputChange.bind(this);
        this.handleQuoteInputChange = this.handleQuoteInputChange.bind(this);

    }

    handleSubmit(e) {

        let newQuote = { 
            text: this.state.inputQuote,
            author: this.state.inputAuthor
        }

        this.props.addQuote(newQuote);

        this.state.inputAuthor = '';
        this.state.inputQuote = '';
        e.preventDefault();
    }

    selectRandomQuote() {
        this.props.selectQuote();
    }

    handleQuoteInputChange(e) {
        this.setState( { inputQuote: e.target.value } );
    }

    handleAuthorInputChange(e) {
        this.setState( { inputAuthor: e.target.value } );
    }

    render() {
        return (
            <div id="quote-box" className="text-center flex-column">
                <div id="text">{this.props.quotes[this.props.currentIndex].text}</div>
                <div id="author">-- {this.props.quotes[this.props.currentIndex].author}</div><br/><br/>
                <button id="new-quote" onClick={this.selectRandomQuote}>Select Random Quote</button><br />
                <a href="http://twitter.com/intent/tweet?" id="tweet-quote">Tweet Quote</a><br/><br/><br/>
                
                <form>
                    <div width="400px" className="col container-fluid">
                        <div><input value={this.state.inputQuote} onChange={this.handleQuoteInputChange} type="text" id="enter-quote" placeholder="Enter new quote..." required /></div>
                        <div><input value={this.state.inputAuthor} onChange={this.handleAuthorInputChange} type="text" id="enter-author" placeholder="Enter author..." required /></div>
                        <div><button onClick={this.handleSubmit} type="submit" className="btn btn-primary">Submit</button></div>
                    </div>
                </form>

            </div>
        )
    }
}



const Provider = ReactRedux.Provider;
const RandomQuoteMachineConnected = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(RandomQuoteMachine);

class RandomQuoteMachineWrapper extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Provider store={store}>
                <RandomQuoteMachineConnected />
            </Provider>
        )
    }
}


ReactDOM.render(
    <RandomQuoteMachineWrapper />,
    document.getElementById('myApp')
);