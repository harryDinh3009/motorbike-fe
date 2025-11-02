import { USER_INFO } from "@/constants/common.const";

export const setUserInfo = (data: Object) => {
  const userInfo = JSON.stringify(data);
  localStorage.setItem(USER_INFO, userInfo);
};

export const getUserInfo = () => {
  return localStorage.getItem(USER_INFO);
};

export const removeUserInfo = () => {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    keysToRemove.push(key);
  }

  keysToRemove.forEach((key: any) => {
    localStorage.removeItem(key);
  });
};

export const setLocalStorage = (key: string, data: Object) => {
  const information = JSON.stringify(data);
  localStorage.setItem(key, information);
};

export const getLocalStorage = (key: any) => {
  return localStorage.getItem(key);
};

export const setSessionStorage = (key: string, data: Object) => {
  const information = JSON.stringify(data);
  sessionStorage.setItem(key, information);
};

export const getSessionStorage = (key: any) => {
  return sessionStorage.getItem(key);
};
