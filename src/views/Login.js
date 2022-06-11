import React, { useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { useNavigate } from "react-router-dom";

import axios from 'axios';

const Login = () => {

  const navigate = useNavigate();
  const [usernameIsCorrectState, setUsernameIsCorrectState] = useState(false);
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState({
    isValid: false,
    values: {
      username: '',
      password: '',
    },
  });

  const handleChange = event => {
    event.persist();

    if(event.target.name === 'username'){
      setMessage('');
      setUsernameIsCorrectState(false);
    }
    
    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]: event.target.value
      }      
    }));
  };

  const handleLogin = event => {
    event.preventDefault();

    //if username is empty just return
    if(formState.values.username === ''){
      return '';
    }

    //password is empty means the user is trying to check his/her username is found or not
    if(usernameIsCorrectState === false){
      axios.post('http://localhost:4000/login/checkUsername', {...formState.values})
      .then(response => {
        if(response.data.results.length > 0) {
          if(response.data.results[0].role === 'EMPLOYEE'){
            navigate('/employee', {state: {info: response.data.results[0]} });
          }
          else if(response.data.results[0].role === 'HR_MANAGER'){
            setUsernameIsCorrectState(true);
          }
          else {
            setUsernameIsCorrectState(false)
            setMessage('Employee ID is not found');
          }
        }
        else {
          setUsernameIsCorrectState(false);
          setMessage('Employee ID is not found');
        }
      });
    }
    //username is check and found but password is not entered then just return
    else if(usernameIsCorrectState === true && formState.values.password === ''){
      return '';
    }
    else{
      //both username and password are found
      axios.post('http://localhost:4000/login/sign-in', {...formState.values})
      .then(response => {
        if(response.data.results.length > 0) {
          navigate('/manager', {state: {info: response.data.results[0]} });
        }
        else {
          setMessage('Password is not correct');
        }
      });
    }
  };

  return (
    <div>
      <form style={{display: 'flex'}} onSubmit={handleLogin}>
        <div style={{flex: '2'}}></div>
        {/* {buildTextFields('Employee ID', 'username', formState.values.username, formState.errors.username, 'text')}     */}
        <div style={{display: 'flex', flexDirection: 'column', flex: '3'}}>
          <label>{message}</label>
          <TextField
            fullWidth
            // required={true}
            label='Employee ID'
            name={'username'}
            value={formState.values.username || ''}
            type='text'
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />

          { usernameIsCorrectState
          ? <TextField
            hidden={true}
            fullWidth
            // required={true}
            label='Password'
            name={'password'}
            value={formState.values.password || ''}
            type='password'
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          : null }
          <Button
            style={{
              backgroundColor: '#036',
              color: 'white',
              width: '100%',
            }}
            size="large"
            type="submit"
            variant="contained"
          >
            { usernameIsCorrectState ? 'Login' : 'Next' }
          </Button>
        </div>
        <div style={{flex: '2'}}></div>
        
      </form>
    </div>
  );
};

export default Login;
