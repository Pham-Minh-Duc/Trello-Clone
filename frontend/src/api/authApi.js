import axiosClient from '../api/axios';

export const requestOTP = (email) => {
  return axiosClient.post('/auth/signup', { email });
};

export const verifyOTP = (email, otp) => {
  return axiosClient.post('/auth/signin', { 
    email: email, 
    verificationCode: otp
 });
};