import React from "react";
import axios from "axios";

export default class Answer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //user: "",
            text:"" ,
            statusCode : 0,
            textError: 0
        };
    }
    handleAnswerPosted = async (event) => {
        event.preventDefault();
        const { text } = this.state;
        let currentStatusCode = 0;
        let currentTextError = 0;

        if (text === "") {
            currentStatusCode = 1;
            currentTextError = 1;
        } else {
            const regex = /\[.*\]\(.*\)/g;
            let matchings = text.match(regex);
    
            if (matchings) {
                matchings.forEach(match => {
                    let linkStartIndex = match.indexOf("(") + 1;
                    let linkEndIndex = match.indexOf(")");
    
                    let link = match.substring(linkStartIndex, linkEndIndex);
    
                    if (link === "" || (!link.startsWith("https://") && !link.startsWith("http://"))) {
                        currentStatusCode = 1;
                        currentTextError = 2;
                    }
                });
            }
        }

        this.setState({ statusCode: currentStatusCode});
        this.setState({ textError: currentTextError});

        if (currentStatusCode === 0) {
            //this.props.model.addAnswer(user, text, this.props.qid);
            //this.props.handlePageType(this.props.qid);
            let answer = {
                answerText: text,
                answerUser: this.props.user.userId,
                answerUsername: this.props.user.username,
                qid : this.props.qid
            }
            await axios.post("http://localhost:8000/addAnswer", answer).then(() => {
                this.props.handlePageType(this.props.qid);
            });
        }

    }
    

    render() {
        const{text, textError} = this.state;
        return (
            <div id = "answer">
                <form id="add_answer" onSubmit={this.handleAnswerPosted}>
                    {/*Username */}
                    {/*
                    <div className="ask_question_question">Username*</div>
                    <div className="error_message"
                        style={{color:"red"}}>{nameError === 0 ? null : "Please enter a username"}
                    </div>
                    <input type="text" id="add_answer_user" className="text_box" value={user} onChange={(event) => this.setState({user: event.target.value})}/>
                    */}   
                    {/*Text */}
                    <div className="ask_question_question">Answer Text*</div>
                    <div className="error_message"
                        style={{color:"red"}}>{textError === 0 ? null : (textError === 1 ? "Please enter text" :  "Hyperlink target cannot be empty and must begin with https:// or http://")}
                    </div>
                    <textarea id="add_answer_text" className="text_box" value={text} onChange={(event) => this.setState({text: event.target.value})}/>

                    <div id="add_answer_footer">
                        <input type="submit" id="post_answer_button" value="Post Answer"/>
                        <div className="mandatory"> * indicates mandatory fields</div>
                    </div>
                </form>
            </div>
        );
    }
}