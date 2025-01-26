import React from "react";
import findTime from "./helperfunctions/time";
import axios from "axios";

export default class Question extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sortedQuestions: [],
            questionPaginationIndex: 0,
            maxPage: 0
        };
    }

    sortUnanswered(data) {
        let ans = [];
        data.forEach(question => {
            if(question["answers"].length === 0) {
                ans.push(question);
            }
        })
        return ans.reverse();
    }
    
    sortActive(data) {
        let unanswered = this.sortUnanswered(data)
        let answered = data.filter(question => !unanswered.includes(question)).sort((q1, q2) => {
            let d1 = q1["answers"][q1["answers"].length - 1]["ans_date_time"];
            let d2 = q2["answers"][q2["answers"].length - 1]["ans_date_time"];
            return d2 - d1
        });
        return answered.reverse().concat(unanswered);
    }
    
    sortNewest(data) {
        let newest = data.sort((q1, q2) => new Date(q2["ask_date_time"]) - new Date(q1["ask_date_time"]))
        return newest;
    }

    async sortQuestions() {
        var sortQuestions = this.props.sortingQuestions;
        try {
            const res = await axios.get("http://localhost:8000/questions");
            let sortedQuestions;
            switch(sortQuestions) {
                case "active":
                    sortedQuestions = this.sortActive(res.data);
                    break;
                case "unanswered":
                    sortedQuestions = this.sortUnanswered(res.data);
                    break;
                default:
                    sortedQuestions = this.sortNewest(res.data);
            }
            this.setState({sortedQuestions:sortedQuestions, maxPage: Math.ceil(sortedQuestions.length/ 5) });
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    }

    
    componentDidMount(){
        this.sortQuestions();
    }

    async componentDidUpdate(props)
    {
        if(props.sortingQuestions !== this.props.sortingQuestions) {
            await this.sortQuestions();
        }
    }

    handlePrevQues =  () => {
        const { questionPaginationIndex } = this.state;
        if (questionPaginationIndex === 0) {
            this.setState({ questionPaginationIndex: 0 }); // Wrap around to the last page
        } else {
            this.setState({ questionPaginationIndex: questionPaginationIndex - 1 });
        }
    }

    handleNextQues = () => {
        const { questionPaginationIndex, maxPage } = this.state;
        if (questionPaginationIndex === maxPage - 1) {
            this.setState({ questionPaginationIndex: 0 }); // Wrap around to the first page
        } else {
            this.setState({ questionPaginationIndex: questionPaginationIndex + 1 });
        }
        }

    questionVote = () =>
    {

    }

    /*we need to iterate through the model and return the display for each question based on the sorting criteria*/
    question_mapping = (array) => {
        //for every question in the sorted model
        return array.map((question) => {
            return (
                <div className = "question_post" key = {question._id}> 
                    <div className="question_stats">
                        <div>{question["answers"].length + " answers"}</div>
                        <div>{question["views"] + " views"}</div>
                        <div>{question["votes"] + " votes"}</div>
                        <div> 
                        <button className="question_upvote" onClick={() => this.questionVote(1)}> {"\u2191"}</button>
                        <button className="question_downvote" onClick={() => this.questionVote(-1)}> {"\u2193"}</button>
                        </div>
                    </div>
                    <div className="question_post_header">
                        <div id="question_post_title" onClick={() => {this.props.handlePageType(question["_id"]); this.props.handleSearchText("");}}>{question["title"]}</div>
                        <div className="question_post_tags">
                            {question.tags.map((tagID) => {
                                return (
                                    <button key={tagID._id} >{tagID.name}</button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="question_author">
                        <span id="red_askedBy">{question["asked_by"]}</span>
                        {" asked " + findTime(new Date(question["ask_date_time"]))}
                    </div>

                </div>
            )
            
        })
    }


    render() {
        const { sortedQuestions ,questionPaginationIndex} = this.state;
        let questionCount = sortedQuestions.length;
        let questionplural = (questionCount ===1) ? " question" : " questions" ;
        const startQuestionIndex = questionPaginationIndex * 5;
        const endQuestionIndex = Math.min(startQuestionIndex + 5, questionCount);
        let sq = sortedQuestions.slice(startQuestionIndex, endQuestionIndex)

        return (

            <div id = "question">

                <div id="question_header">

                    <div id="qheader_top_row">
                        <div className="all_questions">All Questions</div> 
                        {this.props.user.userId !== 0 && <button className="question_button" onClick={() => {this.props.handlePageType("ask");this.props.handleSearchText("")}}>Ask Question</button>}
                    </div>

                    <div id="qheader_bottom_row">
                        <div id="questions_number">{questionCount}{questionplural}</div>
                        <div id="sort_buttons">
                            <button id="newest" onClick={() => this.props.handleSortType("newest")}>Newest</button>
                            <button id="active" onClick={() => this.props.handleSortType("active")}>Active</button>
                            <button id="unanswered" onClick={() => this.props.handleSortType("unanswered")}>Unanswered</button>
                        </div>
                    </div>

                </div>
                

                {/* handling of post loading */}
                { sortedQuestions.length === 0 ?
                    <div id="no_questions_found">No Questions Found</div> : 

                    <div id = "posted_questions">
                        {this.question_mapping(sq)}
                    </div>
                }
                <button onClick={() => this.handlePrevQues()} >
                    Previous
                </button>
                <button onClick={() => this.handleNextQues()} >
                    Next
                </button>
            </div>
        );
    }
}