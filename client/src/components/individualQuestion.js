import React from "react";
import findTime from "./helperfunctions/time";
import includeHyperlink from "./helperfunctions/hyperlink";
import axios from "axios";
export default class individualQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indivQuestion : null,
            answerPaginationIndex: 0,
            maxAnswerPage: 0,
            questionCommentPaginationIndex: 0,
            maxQuestionCommentPage: 0,
            answerCommentPaginationIndex: [],
            maxAnswerCommentPages: []
        };
    }

    async componentDidMount() {
        try {
            //console.log("Question schema id" , this.props.page)
            await axios.post("http://localhost:8000/addView/" + this.props.page);
            const res = await axios.get("http://localhost:8000/questions/" + this.props.page);
            const maxAnswerCommentPages = res.data[0].answers.map((answer) => Math.ceil(answer.comments.length / 3));
            this.setState({indivQuestion: res.data[0], maxAnswerPage:Math.ceil(res.data[0].answers.length/5),
            maxQuestionCommentPage : Math.ceil(res.data[0].comments.length/3,
            maxAnswerCommentPages ) //maxAnswerCommentPage : Math.ceil(res.data[0].answers.comments.length/3)
            });
        } catch (err) {
            console.error("Error fetching question:", err);
        }
    }

    handlePrevAnswer =  () => {
        const { answerPaginationIndex } = this.state;
        if (answerPaginationIndex === 0) {
            this.setState({ answerPaginationIndex: 0 }); // Wrap around to the last page
        } else {
            this.setState({ answerPaginationIndex: answerPaginationIndex - 1 });
        }
    }

    handleNextAnswer = () => {
        const { answerPaginationIndex, maxAnswerPage } = this.state;
        if (answerPaginationIndex === maxAnswerPage - 1) {
            this.setState({ answerPaginationIndex: 0 }); // Wrap around to the first page
        } else {
            this.setState({ answerPaginationIndex: answerPaginationIndex + 1 });
        }
    }

    handlePrevQuestionComment =  () => {
        const { questionCommentPaginationIndex } = this.state;
        if (questionCommentPaginationIndex === 0) {
            this.setState({ questionCommentPaginationIndex: 0 }); // Wrap around to the last page
        } else {
            this.setState({ questionCommentPaginationIndex: questionCommentPaginationIndex - 1 });
        }
    }

    handleNextQuestionComment = () => {
        const { questionCommentPaginationIndex, maxQuestionCommentPage } = this.state;
        if (questionCommentPaginationIndex === maxQuestionCommentPage - 1) {
            this.setState({ questionCommentPaginationIndex: 0 }); // Wrap around to the first page
        } else {
            this.setState({ questionCommentPaginationIndex: questionCommentPaginationIndex + 1 });
        }
    }

    handlePrevAnswerComment = (index) => {
        const { answerCommentPaginationIndex } = this.state;
        const currentIndex = answerCommentPaginationIndex[index];
        if (currentIndex === 0) {
            answerCommentPaginationIndex[index] = 0; // Wrap around to the last page
        } else {
            answerCommentPaginationIndex[index] = currentIndex - 1;
        }
        this.setState({ answerCommentPaginationIndex });
    };

    handleNextAnswerComment = (index, maxPage) => {
        const { answerCommentPaginationIndex } = this.state;
        const currentIndex = answerCommentPaginationIndex[index];
        if (currentIndex === maxPage - 1) {
            answerCommentPaginationIndex[index] = 0; // Wrap around to the first page
        } else {
            answerCommentPaginationIndex[index] = currentIndex + 1;
        }
        this.setState({ answerCommentPaginationIndex });
    };




    handleQuestionCommentPosted = async (event) => {
        event.preventDefault();
        let comment = {
            commentText: event.target.elements.comment.value,
            commentUserId: this.props.user.userId,
            commentUsername: this.props.user.username,
            qid: this.props.page
        };
        try {
            await axios.post("http://localhost:8000/addQuestionComment", comment);
            // Update the component state to trigger a rerender
            this.fetchQuestionData(); // Assuming you have a method to fetch question data
        } catch (error) {
            console.error("Error posting question comment:", error);
        }
    };
    
    fetchQuestionData = async () => {
        try {
            const res = await axios.get("http://localhost:8000/questions/" + this.props.page);
            const maxAnswerCommentPages = res.data[0].answers.map((answer) => Math.ceil(answer.comments.length / 3));
            this.setState({
                indivQuestion: res.data[0],
                maxAnswerPage: Math.ceil(res.data[0].answers.length / 5),
                maxQuestionCommentPage: Math.ceil(res.data[0].comments.length / 3),
                maxAnswerCommentPages
            });
        } catch (error) {
            console.error("Error fetching question data:", error);
        }
    };

    handleAnswerPosted = async (event) => {
        event.preventDefault();
        let answer = {
            answerText: event.target.elements.answer.value,
            answerUserId: this.props.user.userId,
            answerUsername: this.props.user.username,
            qid: this.props.page
        };
        try {
            await axios.post("http://localhost:8000/addAnswerComment", answer);
            // Update the component state to trigger a rerender
            this.fetchQuestionData(); // Assuming you have a method to fetch question data
        } catch (error) {
            console.error("Error posting answer:", error);
        }
    };

    questionVote = () => {

    }

    render() { 
        const {indivQuestion,answerPaginationIndex,questionCommentPaginationIndex, answerCommentPaginationIndex} = this.state;
        //console.log(indivQuestion);
        if (!indivQuestion) {
            return <div>Loading...</div>;
        }

        let answers = indivQuestion["answers"];  //list of question answers
        const startAnswerIndex = answerPaginationIndex * 5;
        const endAnswerIndex = Math.min(startAnswerIndex + 5, answers.length);
        let slicedAnswers = answers.slice(startAnswerIndex, endAnswerIndex)


        let questionComments = indivQuestion["comments"]; //list of question comments
        const startQuestionCommentIndex = questionCommentPaginationIndex * 3;
        const endQuestionCommentIndex = Math.min(startQuestionCommentIndex + 3, questionComments.length);
        let slicedQuestionComments= questionComments.slice(startQuestionCommentIndex, endQuestionCommentIndex)


        let answerCount = answers.length || 0;
        let answerPlural = (answerCount === 1) ? " answer"  : " answers ";
        let viewMessage = indivQuestion["views"] === 1 ? " view" : " views";

       
        return (
            <div id = "individualQuestion">

                <div id="iquestion_header">
                    <div id="iquestion_answer_count">{answerCount}{answerPlural}</div>
                    <div id="iquestion_title">{indivQuestion["title"]}</div>
                    {this.props.user.userId !== 0 && <button className="question_button" onClick={() => {this.props.handlePageType("ask"); this.props.handleSearchText("");}}>Ask Question</button>}
                </div>

            
                <div id="iquestion_data">
                    <div id="iquestion_view_count">{indivQuestion["views"] + viewMessage}</div>
                    <div id="iquestion_view_count">{indivQuestion["votes"]} votes</div>
                    <div id="iquestion_text">{includeHyperlink(indivQuestion["text"])}</div>
                    <div className="iquestion_date">
                        <div id="iquestion_author">{indivQuestion["asked_by"]}</div>
                        <div className="iquestion_date">{" asked " + findTime(indivQuestion["ask_date_time"])}</div>
                    </div> 

                    <form className="questionCommentForm" onSubmit={(event) => this.handleQuestionCommentPosted(event)}>
                        <textarea name = "comment" placeholder="Enter a comment"></textarea>

                        <button type="submit" className="questionSubmitComment">Comment</button>
                    </form> 
                    <div id = "iquestion_comments">
                    { slicedQuestionComments.map( (comment) => {
                        return (
                            <div className = "question_comment" key={comment._id}>
                                <div className="question_comment_text">{includeHyperlink(comment["text"])}</div>
                                <div className="question_comment_text">{comment["votes"]}</div>
                                <div> 
                                    <button className="question_comment_upvote" onClick={() => this.questionVote(1)}> {"\u2191"}</button>
                                    <button className="question+comment_downvote" onClick={() => this.questionVote(-1)}> {"\u2193"}</button>
                                </div>
                                <div className="question_comment_date">
                                    <div id="question_comment_author">{comment["comment_by"]}</div>
                                    <div className="question_comment_date">{"commented " + findTime(comment["comment_date_time"])}</div>
                                </div>
                            </div>
                        )
                    }
                    
                    )}
                    <button onClick={() => this.handlePrevQuestionComment()} >
                    Previous
                    </button>
                    <button onClick={() => this.handleNextQuestionComment()} >
                        Next
                    </button>
                </div>
                </div>

                <div id = "answers">
                    { 

                        slicedAnswers.reverse().map((answer, index) =>{

                            const maxPage = this.state.maxAnswerCommentPages[index];
                            const startAnswerCommentIndex = answerCommentPaginationIndex[index] * 3;
                            const endAnswerCommentIndex = Math.min(startAnswerIndex + 3, answer.comments.length);
                            let slicedAnswerComments = answer.comments.slice(startAnswerCommentIndex, endAnswerCommentIndex);

                            return (
                                <div className ="question_answer" key={answer._id}>
                                    <div className="answer_text">{includeHyperlink(answer["text"])}</div>
                                    <div className="answer_text">{answer["votes"]} votes</div>
                                    <div> 
                                        <button className="answer_upvote" onClick={() => this.questionVote(1)}> {"\u2191"}</button>
                                        <button className="answer_downvote" onClick={() => this.questionVote(-1)}> {"\u2193"}</button>
                                    </div>
                                    <div className="answer_date">
                                        <div id="answer_author">{answer["ans_by"]}</div>
                                        <div className="answer_date">{"answered " + findTime(answer["ans_date_time"])}</div>
                                    </div>

                                    <form className="answerCommentForm" onSubmit={(event) => this.handleAnswerCommentPosted(event,answer._id)}>
                                        <textarea name = "comment" placeholder="Enter a comment"></textarea>

                                        <button type="submit" className="answerSubmitComment">Comment</button>
                                    </form> 
                                    <div id = "ianswer_comments">
                                        {  slicedAnswerComments.map( (comment) => {
                                            return (
                                                <div className = "question_comment" key={comment._id}>
                                                    <div className="question_comment_text">{includeHyperlink(comment["text"])}</div>
                                                    <div className="question_comment_text">{comment["votes"]} votes</div>
                                                    <div> 
                                                        <button className="question_comment_upvote" onClick={() => this.questionVote(1)}> {"\u2191"}</button>
                                                        <button className="question_comment_downvote" onClick={() => this.questionVote(-1)}> {"\u2193"}</button>
                                                    </div>
                                                    <div className="question_comment_date">
                                                        <div id="question_comment_author">{comment["comment_by"]}</div>
                                                        <div className="question_comment_date">{"commented " + findTime(comment["comment_date_time"])}</div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        
                                        )}
                                        <button onClick={() => this.handlePrevAnswerComment(index)} >
                                        Previous
                                        </button>
                                        <button onClick={() => this.handleNextAnswerComment(index, maxPage)} >
                                            Next
                                        </button>
                                    </div>
                                    
                                </div>
                            )
                        })
                    }      
                </div>
                <button onClick={() => this.handlePrevAnswer()} >
                    Previous Answer
                </button>
                <button onClick={() => this.handleNextAnswer()} >
                    Next Answer
                </button>

                <div>
                    {this.props.user.userId !== 0 && <button id = "answer_question_button"  onClick = {() => this.props.handlePageType("answer")}>Answer Question</button>}
                </div>
            </div>
        );
    }
}