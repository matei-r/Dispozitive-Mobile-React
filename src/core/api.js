export const apiUrl = 'http://192.168.43.182:3000/api';
export const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};
export const authHeaders = (token) => ({...headers, 'Authorization': `Bearer ${token}`});
