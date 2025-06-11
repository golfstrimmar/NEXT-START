"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import styles from "./RegisterPage.module.scss";
import Image from "next/image";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { addUser } from "@/app/redux/slices/authSlice";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

interface User {
  id: number;
  userName: string;
  email: string;
  avatar?: string | null;
  createdAt?: string;
}

interface SocketData {
  user?: User;
  message: string;
  token?: string;
  error?: string;
  email?: string;
  userName?: string;
  googleId?: string;
  avatarUrl?: string | null;
}

const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const socket = useSelector((state: any) => state.socket.socket);
  const router = useRouter();
  const dispatch = useDispatch();
  const [userName, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{
    userName: string;
    email: string;
    password: string;
  }>({
    userName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const passwordGoogleInputRef = useRef<HTMLInputElement | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [googleData, setGoogleData] = useState<{
    email: string;
    userName: string;
    googleId: string;
    avatarUrl: string | null;
  } | null>(null);
  const [googlePassword, setGooglePassword] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    socket.on("registrationSuccess", (data: SocketData) => {
      setSuccessMessage(data.message);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      if (data.user) {
        dispatch(addUser(data.user));
      }
      setIsLoading(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setFormErrors({ userName: "", email: "", password: "" });
      setTimeout(() => {
        setOpenModalMessage(false);
        router.replace("/loginPage");
      }, 2500);
    });

    socket.on("googleRegisterSuccess", (data: SocketData) => {
      setSuccessMessage(data.message);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setShowPasswordModal(false);
      if (data.user) {
        dispatch(addUser(data.user));
      }
      setIsLoading(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setFormErrors({ userName: "", email: "", password: "" });
      setGooglePassword("");
      setTimeout(() => {
        setOpenModalMessage(false);
        router.replace("/loginPage");
      }, 2500);
    });

    socket.on("requirePassword", (data: SocketData) => {
      setIsLoading(false);
      setGoogleData({
        email: data.email || "",
        userName: data.userName || "",
        googleId: data.googleId || "",
        avatarUrl: data.avatarUrl || null,
      });
      setShowPasswordModal(true);
    });

    socket.on("registrationError", (data: SocketData) => {
      setIsLoading(false);
      setSuccessMessage(data.message || data.error || "Registration failed");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
      }, 2500);
    });

    return () => {
      socket.off("registrationSuccess");
      socket.off("googleRegisterSuccess");
      socket.off("requirePassword");
      socket.off("registrationError");
    };
  }, [socket, router, dispatch]);

  const validateForm = () => {
    let isValid = true;
    let errors = { userName: "", email: "", password: "" };
    if (!userName) {
      errors.userName = "userName is required";
      isValid = false;
    }
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is not valid";
      isValid = false;
    }
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    setFormErrors(errors);
    return { isValid, errors };
  };

  const handleRegister = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { isValid, errors } = validateForm();
    if (!isValid) {
      const errorList = Object.values(errors).filter((error) => error !== "");
      const newFormErrors = errorList.join(", ");
      setIsLoading(true);
      setSuccessMessage(newFormErrors);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2500);
      return;
    }

    if (socket) {
      socket.emit("register", { userName, email, password });
    }
  };

  const handlerVisiblePassword = () => {
    if (passwordInputRef.current) {
      passwordInputRef.current.type =
        passwordInputRef.current.type === "password" ? "text" : "password";
    }
    if (passwordGoogleInputRef.current) {
      passwordGoogleInputRef.current.type =
        passwordGoogleInputRef.current.type === "password"
          ? "text"
          : "password";
    }
  };

  const responseGoogle = (response: CredentialResponse) => {
    const { credential } = response;
    if (!credential) {
      setSuccessMessage("Google registration failed. Please try again.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2500);
      return;
    }
    if (socket) {
      setIsLoading(true);
      socket.emit("googleRegister", { token: credential });
    }
  };

  const handleGooglePasswordSubmit = () => {
    if (!googlePassword) {
      setSuccessMessage("Password is required");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2500);
      return;
    }
    if (googlePassword.length < 6) {
      setSuccessMessage("Password must be at least 6 characters");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2500);
      return;
    }
    if (googleData && socket) {
      setIsLoading(true);
      socket.emit("setPassword", {
        email: googleData.email,
        password: googlePassword,
        userName: googleData.userName,
        googleId: googleData.googleId,
        avatarUrl: googleData.avatarUrl,
      });
      setGooglePassword("");
    }
  };

  const handleModalExitComplete = () => {
    setIsModalVisible(false);
    if (
      successMessage.includes("Registration successful") ||
      successMessage.includes("Google registration successful")
    ) {
      router.replace("/loginPage");
    }
  };

  return (
    <div className="">
      {isLoading && <Loading></Loading>}
      {isModalVisible && (
        <ModalMessage
          message={successMessage}
          open={openModalMessage}
          onExitComplete={handleModalExitComplete}
        />
      )}
      <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
        Registration
      </h1>
      <form
        className={`my-4 flex flex-col gap-2 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4`}
      >
        <Input
          typeInput="text"
          data="User name"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          typeInput="email"
          data="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="input-password">
          <div className="inline-block relative">
            <Input
              inputRef={passwordInputRef}
              typeInput="password"
              data="User Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Image
              src="/assets/svg/eye.svg"
              alt="eye"
              width={20}
              height={20}
              className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer opacity-50"
              onClick={handlerVisiblePassword}
            />
          </div>
        </div>

        <button className="googleLoginButton">
          <GoogleLogin
            onSuccess={responseGoogle}
            onError={() => {
              setSuccessMessage("Failed to log in via Google.");
              setOpenModalMessage(true);
              setIsModalVisible(true);
              setTimeout(() => {
                setOpenModalMessage(false);
                setSuccessMessage("");
              }, 2500);
            }}
          />
        </button>
        <Button onClick={handleRegister}>Registration</Button>
      </form>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Set Your Password</h3>
            <p>Please set a password to complete your Google registration.</p>
            <div className="input-password">
              <div className="inline-block relative">
                <Input
                  inputRef={passwordGoogleInputRef}
                  typeInput="password"
                  data="Password"
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                />
                <Image
                  src="/assets/svg/eye.svg"
                  width={20}
                  height={20}
                  alt="Picture of the author"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer opacity-50"
                  onClick={handlerVisiblePassword}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGooglePasswordSubmit}>Submit</Button>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setGooglePassword("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
