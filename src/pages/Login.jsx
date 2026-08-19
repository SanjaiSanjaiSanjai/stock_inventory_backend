import {useState} from 'react'

// import files
import Button from '../components/Button'

// import css files
import '../styles/login.css'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../service/auth'
const Login = () => {
    const LOGIN_BTN_CLASSNAME = 'login-btn'
    const navigate = useNavigate();

    const [user,setUser] = useState(
        {
            email: '',
            password: ''
        }
    )
    const [errorMessage,setErrorMessage] = useState('')

    const handlechange = (e) => {
        setErrorMessage('')
        setUser(
            {
                ...user,
                [e.target.name]: e.target.value
            }
        )
    }

    const handleSubmit = async() => {
        try {
            const response_loginapi = await loginUser(user);
            if(response_loginapi.status === 200 || response_loginapi.status === 201){
                const data = response_loginapi.data
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
        <div className='login-form-container'>
            <h2 className='form-title'>Login</h2>
            <div >
                <input type="email" className='login-input' name='email' placeholder='Email' onChange={handlechange}/>
                <input type="password" className='login-input' name='password' placeholder='Password...' onChange={handlechange}/>
            </div>
            <div>
                <Button btnName={'Login'} classname={LOGIN_BTN_CLASSNAME} onclick={handleSubmit}/>
                {errorMessage && (
                    <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
                )}
            </div>
        </div>
    </div>
  )
}

export default Login