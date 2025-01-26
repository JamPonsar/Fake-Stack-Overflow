import React from "react";
import axios from "axios";

export default class MainHeader extends React.Component{

    constructor (props){
        super(props);
    }
    titleOnClick = () => {  //renders to original loaded DOM
        this.props.handlePageType("main");
        this.props.handleSortType("newest");
        this.props.handleQuestionVisibility(true); 
        this.props.handleSearchText("");
    }
    handleKeyPressed = (event) => {
        if (event.key === "Enter") {
            this.props.handlePageType("search");
            this.props.handleSearchText("");
            this.props.handleSearchOutput(event.target.value);
        }
    }
    handleLogout = () => {
        axios.get('http://localhost:8000/logout', { withCredentials: true })
          .then(res => {
            console.log("hey");
            this.props.setIsLoggedIn(false);
            this.props.setClicked("WelcomePage");
          })
          .catch(err => console.error(err));
      };

    render() {
        return (
            <div id = "header">
                <input className="search_bar" id="hidden_search_bar" type = "text"/>
                <h1 id = "header_title" onClick = {() => this.titleOnClick()}> Fake Stack Overflow </h1>
                <div className="user" style={{ fontSize: '3rem' }}>
                Welcome, {this.props.user.username}
                {this.props.user.username &&
                    <button onClick={() => this.handleLogout()} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '10px' }}>Logout</button>
                }
                </div>
                <input className="search_bar"  id="visible_search_bar" type = "text" placeholder="Search..." onKeyDown={(event) => this.handleKeyPressed(event)} value = {this.props.search} onChange = {(event) => this.props.handleSearchText(event.target.value)} />
            </div>
        );
    }

}