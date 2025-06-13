"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/app/redux/store";
import SocketInitializer from "./SocketInitializer";
import { setUser } from "@/app/redux/slices/authSlice";
import { useActivityHandler } from "@/hucks/activityHandler";
import { useDispatch } from "react-redux";

// Компонент для восстановления юзера
const AuthInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      dispatch(setUser({ user, token: storedToken }));
      console.log("Restored user from localStorage:", user);
    }
  }, [dispatch]);

  return null; // Компонент ничего не рендерит
};

// Внутренний компонент для вызова useActivityHandler
const ActivityWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { handleLogout } = useActivityHandler();
  return <>{children}</>;
};

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <SocketInitializer />
      <ActivityWrapper>{children}</ActivityWrapper>
    </Provider>
  );
};

export default ClientWrapper;
