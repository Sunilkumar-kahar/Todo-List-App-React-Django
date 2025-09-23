import { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import style from './Auth_page.module.css';
import personIcon from '../../assets/person.png';
import emailIcon from '../../assets/email.png';
import passwordIcon from '../../assets/password.png';

const BASE_URL = import.meta.env.VITE_API_URL;

function Auth_page(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verify_pass, setVerify_pass] = useState('');
    const [isSignIn, setSignIn] = useState(true);
    const [loadingNotice, setLoadingNotice] = useState(true);

    const navigate = useNavigate();

    const resetForm = ()=>{
        setName('');
        setEmail('');
        setPassword('');
        setVerify_pass('');
    }

    const onChangeName = (e)=>{
        let txt = e.target.value;
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        setName(txt);
    }

    const onChangeEmail = (e)=>{
        const txt = e.target.value;
        setEmail(txt);
    }

    const onChangePassword = (e)=>{
        const txt = e.target.value;
        if(e.target.name === 'password')
            setPassword(txt);
        else
            setVerify_pass(txt);
    }

    const validName = (str)=>{
        if (/^[A-Za-z\s'-]+$/.test(str))
            return true
        if(str === '')
            alert('Name should not be empty.')
        else
            alert('Name must have only alphabets.')
        return false
    }

    const validPassword = (str)=>{
        if(str.length >= 8)
            return true
        if(str === '')
            alert('Enter a password.');
        else if(str.length < 8)
            if(isSignIn == true)
                alert ('Invalid password.')
            else
                alert('Password length must be 8 or more.')
        return false
    }

    const matchPass = (str1, str2)=>{
        if(str1 === str2)
            return true
        else
            alert('Password is not match.')
        return false
    }

    const validEmail = (str)=>{
        if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))
            return true
        if(str === '')
            alert('Email should not be empty.');
        else
            alert('Email is not valid.');
        return false
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        const currentBtn = e.nativeEvent.submitter.value;
        // console.log(currentBtn);
        if(isSignIn && currentBtn !== 'Sign In'){
            setSignIn(false);
            resetForm();
            return;
        }
        else if(isSignIn === false && currentBtn === 'Sign In'){
            setSignIn(true);
            resetForm();
            return;
        }
        
        let data, url;
        if(isSignIn){
            if(!validEmail(email) || !validPassword(password)){
                return;
            }
            url=`${BASE_URL}/api/account/signin/`;
            // console.log(url);
            data = {email, password};
        }
        else{
            if(!validName(name) || !validEmail(email) || !validPassword(password) || !matchPass(password, verify_pass)){
                return;
            }
            url=`${BASE_URL}/api/account/signup/`;
            data = {name, email, password};
        }

        try{
            console.log(url);
            const response = await axios.post(url, data);
            console.log(response.data);
            console.log('axios is completed.');
            console.log("Form submitted.");
            // console.log('access:',response.data.access,' refresh:', response.data.refresh)
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            if(isSignIn){
                alert('Transfer to home page');
                navigate('/home');
            }
            if(!isSignIn){
                alert(`Hello ${name}, You are registerd now.`)
                resetForm();
                setSignIn(true);
            }
        }
        catch(err){
            let errData = err.response;
            let errMsg='';
            if(errData){
                console.error("Auth:", err);
                for(let field in errData){
                    if(Array.isArray(errData[field])){
                        errData[field].forEach(msg => {
                            errMsg += `${field}: ${msg}\n`;
                        });
                    }
                    else{
                        errMsg += `${field}: ${errData[field]}\n`;
                    }
                }
                alert(errMsg+"\nAuthentication failed. Please try again.");
            }
            else{
                errMsg = "Network error: Unable to reach the server. Please try again later.";
                alert(errMsg);
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submit behavior
            if (isSignIn) {
                document.querySelector(`button[value="Sign In"]`).click();
            } else {
                document.querySelector(`button[value="Sign Up"]`).click();
            }
        }
    }

    useEffect(()=>{
        setTimeout(()=>{
            setLoadingNotice(false);
        }, 40000);
    }, []);

    return(
        <div className={style.AuthDiv}>
            { loadingNotice &&
                <div className={style.loadingDiv}>
                    <p className={style.loadingPara}>
                        Notice: Due to the free hosting plan, the app may take a minute to start up on the first load. Please be patient as it wakes up.
                    </p>
                </div>
            }
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                <h1 className={style.title}>{isSignIn ? "Sign In" : "Sign Up"}</h1>
                <hr />
                <div className={style.input_container}>
                    {
                        !isSignIn &&
                            <label className={style.nameLabel}>
                                <img className={style.person} src={personIcon} alt='Person icon'></img>
                                <input type="text" name='usrName' placeholder='Name' onChange={onChangeName} value={name} autoComplete='name' />
                            </label>
                    }
                    <label className={style.emailLabel}>
                        <img className={style.mail} src={emailIcon} alt='Email icon'></img>
                        <input type="text" name='emailId' placeholder='Email Id' onChange={onChangeEmail} value={email} autoComplete='email' />
                    </label>
                    <label className={style.passwordLabel}>
                        <img className={style.password} src={passwordIcon} alt='password icon'></img>
                        <input type="password" name='password' placeholder='Password' onChange={onChangePassword} value={password} autoComplete={isSignIn?'current-password':'new-password'} />
                    </label>
                    {
                        !isSignIn &&
                        <label className={style.reEnterPasswordLabel}>
                            <img className={style.reEnterPassword} src={passwordIcon} alt='password icon'></img>
                            <input type="password" name='reEnterPassword' placeholder='Re-Enter Password' onChange={onChangePassword} value={verify_pass} autoComplete='new-password' />
                        </label>
                    }
                    <p className={style.forgetPass}>Lost password? <a href="#">Click Here!</a></p>
                </div>
                <div className={style.btn}>
                    <button type='submit' className={ `${style.signIn} ${isSignIn ? style.colorBtn : ''}`} value="Sign In">Sign In</button>
                    <button type='submit' className={ `${style.signUp} ${!isSignIn ? style.colorBtn : ''}`} value="Sign Up">Sign Up</button>
                </div>
            </form>
        </div>
    )
}

export default Auth_page;