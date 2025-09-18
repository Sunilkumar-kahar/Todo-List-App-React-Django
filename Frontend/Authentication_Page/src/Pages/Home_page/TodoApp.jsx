import { useState, useEffect, useRef } from 'react';

import style from './TodoApp.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

const get_url = (taskId)=>{
    return (`${BASE_URL}/api/todo/tasks/${taskId ? `${taskId}/` : ''}`);
}

function TodoApp(){
    const [task, setTask] = useState('');
    const [tasks, setTasks] = useState([]);
    const [userName, setUserName] = useState('');
    const [isEdit, setIsEdit] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [disabledBtn, setDisabledBtn] = useState(false);
    const taskInputRef = useRef();
    const editInputRef = useRef();

    const navigate = useNavigate();

    const handleInput = (e)=>{
        let txt = e.target.value;
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        setTask(txt);
    }

    const displayOldTasks = (data)=>{
        if( Array.isArray(data.tasks) ){
            setTasks(data.tasks);
            setUserName(data.tasks[0].user);
        }
        else{
                setUserName(data.user);
            }
    }

    const refreshAccessTokenFun = async()=>{
        const refreshToken = localStorage.getItem("refresh_token");
        if(!refreshToken){
            alert("Login again");
            handleLogOut();
            return null;
        }
        try{
            const refreshUrl = `${BASE_URL}/api/refreshtoken/`;
            const response = await axios.post(refreshUrl, {refresh: refreshToken});
            const access = response.data.access;
            localStorage.setItem('access_token', access);
            return access;
        }
        catch(error){
            // alert("Error refreshing token:", error);
            alert("Session expire. Please Login again.");
            handleLogOut();
            return null;
        }

    }

    const getAuthHeader = async()=>{
        let token = localStorage.getItem("access_token");
        try{
            if(!token)
                throw new Error("No token");
            const varifyTokenUrl = `${BASE_URL}/api/verifytoken/`;
            await axios.post(varifyTokenUrl, {token: token});
        }
        catch(error){
            console.log("Varify token is failed Calling refresh token.");
            const newToken = await refreshAccessTokenFun();
            if(newToken){
                token = newToken;
            }
            else{
                // handleLogOut();
                return null;
            }
        }
        const res = {
            headers: {Authorization:`Bearer ${token}`}
        }
        return res;
    }

    useEffect(()=>{
        const fatch_data = async()=>{
            const res = await getAuthHeader();
            if(res){
                try{
                    const url = get_url()
                    const response = await axios.get(url, res);
                    displayOldTasks(response.data);
                }
                catch(error){
                    alert("Error fetching tasks:", error.response?.data || error.message);
                }
            }
            // else{
            //     // alert('No token found');
            //     handleLogOut();
            // }
        }
        fatch_data();
    },[]);

    const addTask = async()=>{
        let newTask = task.trim();
        if(!newTask){
            alert("Please enter task into task box.");
            return;
        }
        newTask = newTask.charAt(0).toUpperCase() + newTask.slice(1);
        const res = await getAuthHeader();
        if(res){
            try{
                const url = get_url();
                const response = await axios.post(url, {task: newTask}, res);
                // console.log(response);
                setTasks(prev => [...prev, response.data.task]);
                setTask('');
                taskInputRef?.current?.focus();
            }
            catch(error){
                alert(error.response.data.error);
                //console.error("SK---",error.response.data.error);
            }
        }
        // else{
        //     // alert('No token found');
        //     handleLogOut();
        // }
    };

    const deleteTaskDiv = async(taskId)=>{
        const res = await getAuthHeader();
        if(res){
            try{
                const deleteUrl = get_url(taskId);
                const response = await axios.delete(deleteUrl, res);
                // console.log(response);
                setTasks(prev => prev.filter( task => taskId != task.id));
            }
            catch(error){
                console.log(error);
            }
        }
        // else{
        //     // alert('No token found');
        //     handleLogOut();
        // }
        taskInputRef?.current?.focus();
    }

    const toggleCompleteBtn = async(taskId)=>{
        const res = await getAuthHeader();
        if(res){
            try{
                const editUrl = get_url(taskId);
                let taskStatus; 
                let tmpArr = tasks.map((e)=>{
                    if(e.id === taskId){
                        const newTaskObj = {...e, completed : !e.completed};
                        taskStatus = !e.completed;
                        return newTaskObj;
                    }
                    return e;
                });
                const response = await axios.put(editUrl, {completed:taskStatus}, res);
                // console.log(response);
                setTasks(tmpArr);
            }
            catch(error){
                alert(error);
            }
        }
        // else{
        //     // alert('No token found');
        //     handleLogOut();
        // }
        taskInputRef?.current?.focus();
    }

    const editTask = (taskId)=>{
        setIsEdit(taskId);
        const selectEditTask = tasks.find((e)=>e.id === taskId)
        // console.log(selectEditTask.task);
        setEditValue(selectEditTask.task);
    }

    useEffect(()=>{
        if(isEdit !== null){
            setDisabledBtn(true);
            editInputRef?.current.focus();
        }
        else{
            setDisabledBtn(false);
            //taskInputRef?.current.focus();
            setTimeout(() => {
            taskInputRef?.current?.focus(); // Focus the task input after render
        }, 1);
        }
    }, [isEdit]);

    const onChangeTask = (e)=>{
        let txt = e.target.value;
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        setEditValue(txt);
    }

    const saveTask = async(taskId)=>{
        const res = await getAuthHeader();
        if(res){
            try{
                const editUrl = get_url(taskId);
                let updateEditedValue = editValue.trim();
                if(!updateEditedValue){
                    setIsEdit(null);
                    return;
                }
                updateEditedValue = updateEditedValue.charAt(0).toUpperCase() + updateEditedValue.slice(1);
                const response = await axios.put(editUrl, {task: updateEditedValue}, res);
                // console.log(response);
                if(!response.data.warning){
                    // alert(`Message:${response.data.warning}`);
                    let tmpArr = tasks.map((e)=>{
                        if(e.id === taskId){
                            const editedTask = {...e, task : updateEditedValue};
                            return editedTask;
                        }
                        return e;
                    });
                    setTasks(tmpArr);
                }
                setIsEdit(null);
            }
            catch(error){
                alert("SK---",error);
            }
        }
        // else{
        //     // alert('No token found');
        //     handleLogOut();
        // }
    }

    const createTaskDivs = (task)=>{
        const btnStyle = {backgroundColor : task.completed ? 'green' : 'orange'};
        const isEditing = task.id === isEdit;
        return(
            <div key={task.id} className={style.task}>
                {isEditing ? <input type='text' className={style.editTxt} onChange={onChangeTask} ref={editInputRef} value={editValue} onKeyDown={(e)=> {if(e.key === 'Enter') saveTask(task.id)}} ></input> : <div className={style.old_task}>{task.task}</div>}
                {
                isEditing ? 
                <div className={style.taskBtn}>
                    <button className={style.saveBtn} onClick={()=>{saveTask(task.id)}}>Save</button> 
                </div> :
                <div className={style.taskBtn}>
                    <button className={style.completedBtn} onClick={()=>toggleCompleteBtn(task.id)} style={btnStyle} disabled={disabledBtn}>{task.completed ? "Completed" : "Incompleted"}</button>
                    <button className={style.editBtn} onClick={()=>{ editTask(task.id)}} disabled={disabledBtn}>Edit</button>
                    <button className={style.deleteBtn} onClick={()=>{ deleteTaskDiv(task.id)}} disabled={disabledBtn}>Delete</button>
                </div>
                }
            </div>
        );
    }

    const handleLogOut = ()=>{
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/");
    }

    return(
        <div className={style.HomeDiv}>
            <div className={style.TodoApp}>
                <h1 className={style.title}>Todo-List App</h1>
                <h4 className={style.name}>Welcome {userName}</h4>
                <div className={style.taskDiv}>
                    <input type="text" className={style.new_task} onChange={handleInput} value={task} ref={taskInputRef} placeholder='Enter your Task' disabled={disabledBtn} onKeyDown={(e)=>{if (e.key === 'Enter') addTask();}} />
                    <button className={style.addBtn} onClick={addTask} disabled={disabledBtn}>Add</button>
                </div>
                <button className={style.logOutBtn} onClick={handleLogOut}>LogOut</button>
                {/* <div className={style.task_list}> */}
                {

                    tasks.length > 0 &&
                        tasks.map( (task, index) =>(
                            createTaskDivs(task)
                        ))
                }
                {/* </div> */}
            </div>
        </div>
    );
}

export default TodoApp;