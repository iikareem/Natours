import axios from 'axios';
import {showAlert} from './alert';

export const login = async (email,password) => {
  console.log(email,password);
  try{
    const res = await axios({
      method: 'POST',
      url:'http://127.0.0.1:3000/api/v1/users/login',
      data:{
        email,
        password
      }
    })
    if (res.data.status === 'Success'){
      showAlert('success','Logged in Successfully !');
      window.setTimeout(()=>{
        location.assign('/');
      },1000);
    }
  }
  catch (err){
    showAlert('success',err.response.data.message)
  }

};

export const  logout = async () =>{
  try{

  const res = await axios({
    method: 'GET',
    url : 'http://127.0.0.1:3000/api/v1/users/logout'
  })

  if (res.data.status === 'success') location.reload(true)
  }
  catch (err){
    showAlert('error','Error Logging out !')
  }
}

