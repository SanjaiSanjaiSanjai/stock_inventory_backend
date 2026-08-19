import {useNavigate} from 'react-router-dom'
import { useState } from 'react'
// import css files
import '../styles/signup.css'

import Button from '../components/Button'
import { signupUser } from '../service/auth'

const Signup = () => {
    const  SIGNUP_BTN_CLASSNAME = 'signup-btn';
    const navigate = useNavigate()

    const [user,setUser] = useState(
        {
            username: '',
            email: '',
            password: ''
        }
    );
    const [errorMessage,setErrorMessage] = useState('')

    const handlechange = (e) => {
        setErrorMessage('')
        setUser(
            {
                ...user,
                [e.target.name]: e.target.value,
            }
        )
    }

    const handleSubmit = async() => {
        try {
            const response_signupapi = await signupUser(user);
            if(response_signupapi.status === 200 || response_signupapi.status === 201){
                const data = response_signupapi.data;
                const accessToken = data.access_token || data.accessToken || data.token
                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken)
                }
                setErrorMessage('')
                navigate('/home');
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                error?.response?.data?.error ||
                error?.message ||
                'Something went wrong. Please try again.'

            setErrorMessage(message)
        }
    }
  return (
    <div>
        <div className='signup-form-container'>
            <h2 className='form-title'>Signup</h2>
            <div>
                <input type="text" className='signup-inputs' placeholder='Username' onChange={handlechange} value={user.username} name='username'/>
                <input type="email" className='signup-inputs' placeholder='Email' onChange={handlechange} value={user.email} name='email'/>
                <input type="password" className='signup-inputs' placeholder='Password' onChange={handlechange} value={user.password} name='password'/>
            </div>
            <div>
                <Button btnName={'Signup'} classname={SIGNUP_BTN_CLASSNAME} onclick={handleSubmit}/>
                {errorMessage && (
                    <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
                )}
            </div>
            <div><p>already have account <a href="/login">login</a></p></div>
        </div>
    </div>
    
  )
}

export default Signup