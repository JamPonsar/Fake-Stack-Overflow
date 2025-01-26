import React from "react"
import axios from "axios"

export default class Ask extends React.Component {
    constructor(props) {
        super(props); //setclicked  user setQuestion setAllQuestionsTitle questionList setQuestionList
        this.state = {
            title : "",
            questionContent: "",
            tagsContent: "",
            summary: "",
            statusCode: 0, //default status code of 0 means no errors 
            titleError: 0,
            textError: 0,
            tagError: 0,
            summaryError: 0
        };
    }

    handleAskInputChange = (event) => {
        const {name, value} = event.target;
        this.setState({ [name]: value });
    }

    handleQuestionPosted  = async (event) => {
        event.preventDefault() //avoid default rerendering when form submitted 

        let reputation = 0;
        try {
            const response = await axios.get('http://localhost:8000/checkLoggedIn', { withCredentials: true });
            const userId = response.data.userId;

            const reputationResponse = await axios.get('http://localhost:8000/getReputation/' + this.props.user.userId);
            reputation = reputationResponse.data[0].reputation;
            console.log(`User ${userId} has reputation ${reputation}`);
        } catch (error) {
            console.error(error);
        }

        const {title, questionContent, tagsContent, summary} = this.state;
        let currentStatusCode = 0; //assuming working by default 
        let currentTitleError = 0;
        let currentTextError = 0;
        let currentTagError = 0;
        let currentSummaryError = 0;

        if (title.trim().length < 1) {
            currentStatusCode = 1;
            currentTitleError = 1;
        } else if(title.trim().length > 100) {
            currentStatusCode = 1;
            currentTitleError = 2;
        };

        if (questionContent.trim().length < 1) {
            currentStatusCode = 1;
            currentTextError = 1;
        } else {
            const regex = /\[(.*?)\]\((.*?)\)/g; // Regex to match [text](link)
            let matchings; 
            while ((matchings = regex.exec(questionContent)) !== null) { //loop thorugh all matchings of a potential hyperlink
                const hyperlinkLink = matchings[2]; // Link inside ()
        
                // Check if the hyperlink link is empty or does not start with "http://" or "https://"
                if (!hyperlinkLink.trim() || (!hyperlinkLink.trim().startsWith("http://") && !hyperlinkLink.trim().startsWith("https://"))) {
                    currentStatusCode = 1;
                    currentTextError = 2;
                    break; // Exit the loop if an error is found
                }
            }
        };
        
        //checking for exisiting tags when reputiation is less than 50
        let dbtags = await axios.get("http://localhost:8000/tags");
        let tags = tagsContent.trim().toLowerCase().split(" ")
        if (reputation < 50){
            for (let i = 0; i < tags; i++) {
                // find the tag in the tags array with a matching name
                const tag = dbtags.find((t) => t.name === tags[i]);
                
                if (!tag) {
                    currentStatusCode = 1;
                    currentTagError = 3;
                }
            }
        }

        if (tagsContent.trim().length < 1) {
            currentStatusCode = 1;
            currentTagError = 1;
        } else {
            let checkTagsValidityReturn = this.checkTagsValidity(tagsContent)
            if (checkTagsValidityReturn === "") {
                currentStatusCode = 1;
                currentTagError = 2;
            } else {
                this.setState({tagsContent:checkTagsValidityReturn});

            }
        };

        if (summary.trim().length < 1) {
                currentStatusCode = 1;
                currentSummaryError = 1;
        }

        if (summary.trim().length > 140) {
            currentStatusCode = 1;
            currentSummaryError = 2;
    }

        this.setState({titleError:currentTitleError});
        this.setState({textError:currentTextError});
        this.setState({tagError:currentTagError});
        this.setState({summaryError:currentSummaryError});

        if (currentStatusCode === 0) {
            let question = {
                questionTitle: title,
                questionText: questionContent,
                questionTags: tagsContent,
                questionSummary: summary,
                questionUserId:this.props.user.userId,
                questionUsername:this.props.user.username
            }
            
            await axios.post("http://localhost:8000/addQuestion", question).then(() => {
                this.props.handlePageType("main");
            });
        }
    }

    //return either string if valid or boolean if not 
    checkTagsValidity = (tags) => {
        tags = tags.trim().toLowerCase().split(" ");
        let distinct = []; //distinct tags
        
        let validTags = true;
        tags.forEach(tag => {
            if (tag.length > 20) {
                validTags = false; 
            }
            
            if (!distinct.includes(tag)) {
                distinct.push(tag); 
            }
        });
        
        if (distinct.length > 5) {
            return ""; // Return false if the number of tags exceeds 5
        }
        
        // If all tags are valid, return a string containing the distinct tags joined by whitespace
        if (validTags) {
            return distinct.join(" "); //white space between each tag as one return string  
        } else {
            return ""; // Return false if any tag is invalid
        }
    };
    


    render() {

        const { title, questionContent, tagsContent, summary, titleError, textError, tagError, summaryError} = this.state;
        return (

            <div id = "ask">
                <form id = "ask_question" onSubmit={(event) => this.handleQuestionPosted(event)}>

                    {/*Title */}
                    <div className="ask_question_question">Question Title*</div>
                    <div className="hint">Limit title length to 100 characters or less</div>
                    <div className="error_message" 
                        style={{color:"red"}}>{titleError === 0 ? null : (titleError === 1 ? "Please enter a title" : "Please limit title length to 100 characters or less")}
                    </div>
                    <input type="text" id="ask_question_title" name="title" value={title} onChange={(event) => this.handleAskInputChange(event)}/>

                    {/*Question Content */}
                    <div className="ask_question_question">Question Text*</div>
                    <div className="hint">Add details</div>
                    <div className="error_message" 
                        style={{color:"red"}}>{textError === 0 ? null : (textError === 1 ? "Please enter text" : "Hyperlink target cannot be empty and must begin with https:// or http://")}
                    </div>
                    <textarea id = "ask_question_text" className="text_box" name="questionContent" value={questionContent} onChange={(event) => this.handleAskInputChange(event)}/>

                    {/*Tags Content */}
                    <div className="ask_question_question">Tags*</div>
                    <div className="hint">Add keywords seperated by whitespaces</div>
                    <div className="error_message" 
                        style={{color:"red"}}>{tagError === 0 ? null : (tagError === 1 ? "Please enter atleast one tag" : (tagError === 2 ? "Please submit at most 5 tags with each tag being at most 10 characters" :"You do not have enough reputation to make a new tag "))}                        
                    </div>
                    <input type="text" id="ask_question_tags" className="text_box" name="tagsContent" value={tagsContent} onChange={(event) => this.handleAskInputChange(event)}/>
                    {/*Summary */}

                    <div className="ask_question_question">Summary*</div>
                    <div className="error_message" 
                        style={{color:"red"}}>{summaryError === 0 ? null :(summaryError === 1 ? "Please enter a summary" : "Summary cannot exceed 140 characters")}
                    </div>
                    <input type="text" id="ask_question_user" className="text_box" name="summary" value={summary} onChange={(event) => this.handleAskInputChange(event)}/>

                    <div id = "ask_question_footer">
                        <button type="submit" id="post_question_button">Post Question</button>
                        <div className="mandatory"> * indicates mandatory fields</div>

                    </div>

                </form>
            </div>
        );
    }
}