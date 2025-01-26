import React from 'react'
import { qttoggle } from './helperfunctions/qttoggle';
import MainHeader from './mainHeader';
import Question from './question';
import Ask from './ask';
import Answer from './answer';
import Tags from './tags';
import Search from './search';
import IndividualQuestion from './individualQuestion';


export default class Display extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: "main",
            sortingQuestions: "newest",
            showQuestionsBool: true,
            individualQuestionId: "",
            search: "",
            outputSearch: ""
        };
    }

    handlePageType = (p) => {
        this.setState({page: p})
        const validPages = ["main", "ask", "answer", "tags", "search"];
        if (!validPages.includes(p)) {
            this.setState({ individualQuestionId: p });
        }
    }

    handleSortType = (s) => {
        this.setState({sortingQuestions: s});
        this.handlePageType("main");
    }

    handleQuestionVisibility = (visibility) => {
        this.setState({showQuestionsBool: visibility});
    }

    handleSearchText = (s) => {
        this.setState({search: s});
    }

    handleSearchOutput =  (out) => {
        this.setState({outputSearch:out});
    }

    render() {
        const {page, sortingQuestions, showQuestionsBool, individualQuestionId, search, outputSearch} = this.state;

        let pageComponent;
        switch(page) {
            // Create the different class models, Like Main, Ask
            case "main":
                pageComponent = <Question user = {this.props.user} handlePageType={this.handlePageType} handleSortType={this.handleSortType} handleSearchText={this.handleSearchText} sortingQuestions={sortingQuestions}/>;
                break;
            case "ask":
                pageComponent = <Ask  user = {this.props.user}setClicked = {this.props.setClicked} setQuestion={this.props.setQuestion} setAllQuestionsTitle={this.props.setAllQuestionsTitle} questionList={this.props.questionList} setQuestionList={this.props.setQuestionList} handlePageType={this.handlePageType}/>;
                break;
            case "answer":
                pageComponent = <Answer  user = {this.props.user} handlePageType={this.handlePageType} qid={individualQuestionId} />;
                break;
            case "tags":
                pageComponent = <Tags user = {this.props.user} handlePageType={this.handlePageType} handleQuestionVisibility={this.handleQuestionVisibility} handleSearchText={this.handleSearchText} handleSearchOutput={this.handleSearchOutput}/>;
                break;
            case "search":
                pageComponent = <Search user = {this.props.user} handlePageType={this.handlePageType} handleSortType={this.handleSortType} handleSearchText={this.handleSearchText} search={outputSearch}/>;
                break;
            default:
                pageComponent = <IndividualQuestion user = {this.props.user} handlePageType={this.handlePageType} handleSearchText={this.handleSearchText} page={page} />;
        }

        return (
            <div id="body">
                <MainHeader user = {this.props.user} setIsLoggedIn = {this.props.setIsLoggedIn} setClicked = {this.props.setClicked} handlePageType={this.handlePageType} handleSortType={this.handleSortType} handleSearchText={this.handleSearchText} handleQuestionVisibility={this.handleQuestionVisibility} handleSearchOutput={this.handleSearchOutput} search={search}/>
                <div id="display">
                    {/*set up "menu" qttoggle for left column, page component for right column*/}
                    {qttoggle(this.handlePageType, this.handleSortType, this.handleQuestionVisibility, this.handleSearchText, showQuestionsBool)}
                    {pageComponent}
                </div>
            </div>
        );
    }
}