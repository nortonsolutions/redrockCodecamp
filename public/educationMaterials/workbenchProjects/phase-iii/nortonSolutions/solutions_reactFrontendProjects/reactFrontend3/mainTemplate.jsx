/**
 * Markdown Previewer by Norton 2021
 */

 const actionName = (payload) => ({
    type: type,
    payload
 })
 
 const initialState = {
 
 }
 
 const reducer = (state = initialState, { type, payload }) => {
    switch (type) {
 
    case actionName:
        return { ...state, ...payload }
 
    default:
        return state
    }
}

const store = Redux.createStore(reducer);


// PRESENTATIONAL
class MarkdownPreviewer extends React.Component {
    constructor(params) {
        super(params);
    }
  
    render() {
        return (
            <div>Testing</div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
    }
}
    

const mapDispatchToProps = (dispatch) => {
    return {
    }
};


const MarkdownPreviewerConnnected = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(MarkdownPreviewer);

const Provider = ReactRedux.Provider;

class MarkdownPreviewerWrapped extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Provider store={store}>
                <MarkdownPreviewerConnnected />
            </Provider>
        )
    }
}

ReactDOM.render(
    <MarkdownPreviewerWrapped />,
    document.getElementById('myApp')
)