import React from "react";
import findTime from "./helperfunctions/time";
import axios from "axios";

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questionsArr: [],
            searchPaginationIndex: 0,
            maxPage: 0
        };
    }

    componentDidMount() {
        this.search();
    }

    async componentDidUpdate(prevProps) {
        if(prevProps.search !== this.props.search) {
            await this.search();
        }
    }

    async search() {
        try {
            var array = new Set();
            var unique = [];
            let searchArray = this.props.search.trim().toLowerCase().split(" ");
            for(const search of searchArray) {
                if(search.startsWith("[") && search.endsWith("]")) {
                    let tag = search.substring(1, search.length - 1);
                    const tagSearchRes = await axios.get("http://localhost:8000/searchTag/" + tag);
                    tagSearchRes.data.forEach(question => {
                        if(!unique.includes(question._id)) {
                            unique.push(question._id);
                            array.add(question);
                        }
                    });
                } else {
                    const wordSearchRes = await axios.get("http://localhost:8000/searchWord/" + search);
                    wordSearchRes.data.forEach(question => {
                        if(!unique.includes(question._id)) {
                            unique.push(question._id);
                            array.add(question);
                        }
                    });
                }
            }
            this.setState({ questionsArr: Array.from(array), maxPage: Math.ceil(Array.from(array).length/ 5) });
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    }

    handlePrevSearch =  () => {
        const { searchPaginationIndex} = this.state;
        if (searchPaginationIndex === 0) {
            this.setState({ searchPaginationIndex: 0 }); // Wrap around to the last page
        } else {
            this.setState({ searchPaginationIndex: searchPaginationIndex - 1 });
        }
    }

    handleNextSearch = () => {
        const { searchPaginationIndex, maxPage } = this.state;
        if (searchPaginationIndex === maxPage - 1) {
            this.setState({ searchPaginationIndex: 0 }); // Wrap around to the first page
        } else {
            this.setState({ searchPaginationIndex: searchPaginationIndex + 1 });
        }
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
                    </div>
                    <div className="question_post_header">
                        <div id="question_post_title" onClick={() => {this.props.handlePageType(question["_id"]); this.props.handleSearchText("");}}>{question["title"]}</div>
                        <div className="question_post_tags">
                            {question["tags"].map((tagID) => {
                                return (
                                    <button key={tagID} >{tagID["name"]}</button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="question_author">
                        <span id="red_askedBy">{question["asked_by"]}</span>
                        {" asked " + findTime(question["ask_date_time"])}
                    </div>

                </div>
            )
        })
    }

    render() {
        
        const{questionsArr,searchPaginationIndex} = this.state;
        let questionCount = questionsArr.length;
        let questionplural = (questionCount ===1) ? " question" : " questions" ;
        const startSearchIndex = searchPaginationIndex * 5;
        const endSearchIndex = Math.min(startSearchIndex + 5, questionCount);
        let qa= questionsArr.slice(startSearchIndex, endSearchIndex)

        return (
            <div id = "question">
                
                <div id="question_header">
                    <div id="qheader_top_row">
                        <div className="all_questions">Search Results</div> 
                        {this.props.user.userId !== 0 && <button className="question_button" onClick={() => this.props.handlePageType("ask")}>Ask Question</button>}
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


                { questionCount === 0 ?
                    <div id="no_questions_found">No Questions Found</div> : 

                    <div id = "main_posts">
                        {this.question_mapping(qa)}
                    </div>
                }
                <button onClick={() => this.handlePrevSearch()} >
                    Previous
                </button>
                <button onClick={() => this.handleNextSearch()} >
                    Next
                </button>
            </div>
        );
    }
}