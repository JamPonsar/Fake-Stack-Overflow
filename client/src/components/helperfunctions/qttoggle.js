export function qttoggle (handlePageType, handleSortType,handleQuestionVisibility, handleSearchText, showQuestionsBool) {

    let questionsOnClick = () => {
        handlePageType("main"); //page type becomes main
        handleQuestionVisibility(true); //showquestionbool becomes true 
        handleSortType("newest");// sort type is newest by defauly
        handleSearchText(""); //search bar is empty
    }

    let tagsOnClick = () => {
        handlePageType("tags"); //page type becomes tags
        handleQuestionVisibility(false); //showquestionbool becomes true 
        handleSearchText(""); //search bar is empty
    }

    return (
        <div id="left_column">
            {/*current transparency depends on the showQuestionsBool prop of the model and it toggles based on the onClick Functions*/}
            <h1 id="questions_page_button" onClick={questionsOnClick}>Questions</h1>
            <h1 id="tags_page_button" onClick={tagsOnClick}>Tags</h1>
        </div>
    )
    
}
