import { Component } from "react";
import { Circles } from "react-loader-spinner";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

import Button from "@mui/material/Button";


import "./index.css";


const apiConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS"
}

class TodoList extends Component {
  state = {todo:[],isDone : 0,apiStatus : apiConstants.initial,searchInput : ""};


  componentDidMount() {
    this.getTodos()
  }

  getTodos = async () =>{

    this.setState({apiStatus : apiConstants.inProgress })

    const url = "http://localhost:3000/todos/";
    const options = {method : "GET"}
    const response = await fetch(url,options);

    const data = await response.json();
    console.log(data)
    const updatedData = data.map(eachItem => ({
      id : eachItem.id,
      name : eachItem.name,
      is_done : eachItem.is_done,
      updatedAt : eachItem.updated_at
    }))
    this.setState({todo : updatedData, apiStatus: apiConstants.success})
  }

  renderLoader = () =>(
    <div>
      <Circles
        height="80"
        width="80"
        radius="9"
        color="blue"
        ariaLabel="circles-loading" 
        wrapperClassName=""
        visible={true}
      />    
    </div>
  )


  onClickComplete = async (id) =>{
    const {todo} = this.state
    const selectedTodo = todo.find(eachItem => eachItem.id === id)
    const updatedStatus = selectedTodo.is_done === 1 ? 0 : 1

    const url = `http://localhost:3000/todos/${id}/`
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ is_done: updatedStatus })
    }

    const response = await fetch(url, options)
    

    if (response.ok) {
      const updatedTodos = todo.map(eachItem =>
        eachItem.id === id ? { ...eachItem, is_done: updatedStatus } : eachItem
      )

      this.setState({ todo: updatedTodos })
    }
  }

  onClickDelete = async (id) =>{
    const {todo} = this.state 

    const url = `http://localhost:3000/todos/${id}/`;
    const options = {method : "DELETE"}
    const response = await fetch(url,options);
     
    if (response.ok === true){
      const updatedTodos = todo.filter(eachItem => eachItem.id !== id)
      this.setState({todo : updatedTodos})

    }
    
  }

  renderTodos = () =>{
    const {todo} = this.state
    console.log(todo)
    return(
      <ul className="todo-list">
        {todo.map(eachItem => (
          <li className="todo-item" key={eachItem.id}>
            <p className="todo-name">{eachItem.name}</p>
            <div className="todo-status-container">
            {eachItem.is_done === 1 ? <div>
              <p className="todo-completed">Done</p>
            <p className="updatetime">{eachItem.updatedAt}</p>
            </div>

             : <p className="todo-pending">Pending</p>}

            </div>
            <div>
          
{eachItem.is_done === 0 && (
  <button
    type="button"
    className="delete-button"
    onClick={() => this.onClickComplete(eachItem.id)}
  >
    <FaCheckCircle color="green" fontSize={18} />
  </button>
)}
  <button type="button" className='delete-button' onClick={() =>this.onClickDelete(eachItem.id)}>
    <FaTimes color="red" fontSize={18}/>
    </button>
             </div>
          </li>
        ))}
      </ul>
    )
  }

  renderAllViews = () =>{

    const {apiStatus} = this.state 

    switch(apiStatus){
      case apiConstants.success:
        return this.renderTodos()   
      case apiConstants.inProgress:
        return this.renderLoader()
      default:
        return null
    }
  }

  onChangeSearchInput = event =>{
    this.setState({searchInput : event.target.value})
  } 

  renderPostView  = async () =>{

    const {searchInput, todo} = this.state
    
    if (searchInput.trim() === "") {
    return;
  }
    const url = "http://localhost:3000/todos/";
    const options = {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"},
        body : JSON.stringify({name : searchInput})
      }
    
    const response = await fetch(url,options)
    const data = await response.json()
    console.log(data) 

    if (response.ok === true){
       this.setState({searchInput : ""})
       this.getTodos()
    
    }

   }
  

  
  
  

  render() {

    const {searchInput} = this.state

    return (
      <div className="container">
        <h1 className="heading">Todo List</h1>
        <div className="search-container">
          <input type="text" value={searchInput} onChange={this.onChangeSearchInput} placeholder="Add a new task" className="input" />
          <Button   className="add-button"
  type="button"
  variant="outlined"
  sx={{ marginLeft: "15px" }}
   onClick={this.renderPostView}>
            Add
          </Button>
        </div>
        {this.renderAllViews()}
      </div>
    )
  }
}

export default TodoList;
