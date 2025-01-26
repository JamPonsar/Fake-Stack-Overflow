import Display from '../components/display.js'
import { useState, useEffect } from "react";
import React from 'react';
import axios from 'axios';

import Login from "../components/user/login.js"
import Register from "../components/user/register.js"
import Welcome from "../components/user/welcome.js"

export default function FakeStackOverflow() {

  const [questionList, setQuestionList] = useState(); //Question State 
  const [allQuestionsTitle, setAllQuestionsTitle] = useState(""); //Title State 
  const [clicked, setClicked] = useState("WelcomePage"); //Page state : default welcome page
  const [isLoggedIn, setIsLoggedIn] = useState(false); //Logged In State : deafult not logged in 
  const [user, setUser] = useState(); //User State


  useEffect(() => {
    axios.get('http://localhost:8000/getAllQuestions')  
    .then(function (response) {
      //console.log(response?.data);
      setQuestionList(response?.data);   
    })
    .catch(function (error) {
      //console.log(error);
    });
    }, []);
  
    useEffect(() => { 
      axios.get('http://localhost:8000/checkLoggedIn', { withCredentials: true })
      .then(function (response) {
        //console.log(response?.data);
        setIsLoggedIn(true); //set login to true
        setUser(response?.data); //gets user
        setClicked("HomePage"); //default homepage 
      })
      .catch(function (error) {
        console.log(error);
      });
      }, [isLoggedIn]);


  return (
    <section className="fakeso">
      {!isLoggedIn && questionList && <div className="bodyContent"> 
        {clicked === "WelcomePage" && (
          <Welcome
          setClicked={setClicked}
          questionList={questionList}
          setQuestionList={setQuestionList}
          allQuestionsTitle={allQuestionsTitle}
          setAllQuestionsTitle={setAllQuestionsTitle}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />)}
        {clicked === "RegisterPage" && (
          <Register
          questionList={questionList}
          setQuestionList={setQuestionList}
          allQuestionsTitle={allQuestionsTitle}
          setAllQuestionsTitle={setAllQuestionsTitle}
          setClicked={setClicked}
          />
        )}
        {clicked === "LoginPage" && (
          <Login
          isLoggedIn = {isLoggedIn}
          setIsLoggedIn = {setIsLoggedIn}
          setClicked={setClicked}
          questionList={questionList}
          setQuestionList={setQuestionList}
          allQuestionsTitle={allQuestionsTitle}
          setAllQuestionsTitle={setAllQuestionsTitle}
          />
        )}
      </div>}
      {isLoggedIn && questionList && user && <div className="bodyContent"> 
        <Display questionList = {questionList} setQuestionList={setQuestionList} allQuestionsTitle = {allQuestionsTitle} setAllQuestionsTitle = {setAllQuestionsTitle}
        clicked = {clicked} setClicked = {setClicked} isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn} user = {user} setUser = {setUser}/>
      </div>}
    </section>
  );
}
