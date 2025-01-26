import React from "react";
import axios from "axios";
export default class Tags extends React.Component {
    /*we need to iterate through the model and return the display for each tag*/

    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            questionCounts:[]
        };
    }

    /*tag_mapping  = () => {
        let questionplural;
        let tagCount; //let to be reassigned 
        return this.props.model.data.tags.map((tag) => {
        tagCount = this.props.model.findQuestionsByTag(tag.name).length;  tagCount === 1 ? questionplural = " question": questionplural = " questions"; 
        //jsx return for each tag
        return (
            <div class="tag">
                <button id="tag_link" onClick={(event) => this.onTagClick(event)}> {tag.name} </button>
                <div> {tagCount + questionplural}</div>
            </div>

        );
        });
    }
    */

    tag_mapping  = () => {
        const {tags, questionCounts} = this.state;
        let questionplural;
        let tagCount; //let to be reassigned 
        return tags.map((tag,index) => {
        tagCount = questionCounts[index];  tagCount === 1 ? questionplural = " question": questionplural = " questions"; 
        //jsx return for each tag
        return (
            <div className="tag" key={index}>
                <button id="tag_link" onClick={(event) => this.onTagClick(event)}> {tag.name} </button>
                <div> {tagCount + questionplural}</div>
            </div>

        );
        });
    }
    
    onTagClick = async (event) => {
        this.props.handlePageType("search");
        this.props.handleQuestionVisibility(true);
        this.props.handleSearchOutput("[" + event.target.innerText + "]");
    }

    async componentDidMount() {
        try {
            // Fetch tags
            const tagsRes = await axios.get("http://localhost:8000/tags");
            const tagsData = tagsRes.data;
            this.setState({ tags: tagsData });

            // Fetch question counts
            console.log(tagsData);
            const promises = tagsData.map(tag => axios.get("http://localhost:8000/tagQuestionCount/" +tag._id));
            const responses = await Promise.all(promises);
            const counts = responses.map(response => response.data.count);
            console.log(responses.map(response =>response.data.tid));
            console.log(counts)
            this.setState({ questionCounts: counts });
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    }

    render() {
        const {tags} = this.state;
        let tagCount = tags.length;
        let tagplural = (tagCount ===1) ? " Tag" : " Tags" ;
        return (
            
            <div id = "tags">
                {/*header for tag page*/} 
                <div id="tags_header">
                    <div id="tags_number">{tagCount}{tagplural}</div>
                    <div>All Tags</div>
                    {this.props.user.userId !== 0 && <button id="tags_ask_question" className="question_button" onClick={() => {this.props.handlePageType("ask"); this.props.handleSearchText("");}} >Ask Question</button>}
                </div>

                {/*body for tag page*/}
                <div id = "all_tags">
                    {this.tag_mapping()}
                </div>


            </div>
        );
    }
}
