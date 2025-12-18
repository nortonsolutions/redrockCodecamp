/**
 * Markdown Previewer by Norton 2021
 * 
 * A little overblown here just to test React-Redux interactions
 */

var initialMarkup = `
# Norton's Markdown Previewer
## Test2
[Link to MongoDB](https://www.mongodb.com/)[target="_blank"]
\`\`\`bash
$ npm install
\`\`\`

## Technology Stack
  * Webserver uses ExpressJS routes for webservice URLs and Mongoose to retreive data from MongoDB.
  * MongooseJS Object Definition Language (ODL) schema files define MongoDB schemas.

> Blockquote\n

![Yo yo](https://redrockcode.com/educationMaterials/images/growth-iot.jpg)

**Strong text**
`

const markedOptions = {
    breaks: true
}

const initialState = {
    convertedInput: marked(initialMarkup, markedOptions)
}

const CONVERT = 'CONVERT'

const convertInputAction = (payload) => ({
    type: CONVERT,
    payload
})

const asyncReducer = (state = initialState, { type, payload }) => {
    switch (type) {
 
    case CONVERT:
        return { ...state, ...payload }
 
    default:
        return state
    }
}

const store = Redux.createStore(asyncReducer, Redux.applyMiddleware(ReduxThunk.default));


// PRESENTATIONAL
class MarkdownPreviewer extends React.Component {
    constructor(params) {
        super(params);
        this.handleInputAsync = this.handleInputAsync.bind(this);
        this.state = {
            input: initialMarkup
        }

    }

    handleInputAsync(e) {

        this.setState({
            input: e.target.value
        })

        let cText = marked(e.target.value, markedOptions);
        this.props.convertInput({ convertedInput: cText } );
        document.getElementById('preview').innerHTML = cText;

    }
  
    render() {

        return (
            <div className="row mt-2 ml-2">
                <div className="col-4">
                    <div className="text-primary">Markdown:</div>
                    <textarea onChange={this.handleInputAsync} name="editor" id="editor" defaultValue={this.state.input} />
                </div>
                <div className="col-8">
                    <div className="text-primary">Converted:</div>
                    <div id="preview"></div>            
                </div>
           </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        convertedInput: state.convertedInput
    }
}
    

const mapDispatchToProps = (dispatch) => {
    return {
        convertInput: function(payload) {
            dispatch(convertInputAction(payload));
        }
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

document.getElementById('preview').innerHTML = initialState.convertedInput;