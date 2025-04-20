"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Burger from "../ui/Burger/Burger";
import styles from "./Navbar.module.scss";
import { useSelector, useDispatch } from "react-redux";
// import { clearUser } from "@/app/redux/slices/authSlice";
import { useRouter, useParams, usePathname } from "next/navigation";

interface User {
  _id?: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  // const dispatch = useDispatch();
  // const user = useSelector((state: any) => state.auth.user as User);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const [activeLink, setactiveLink] = useState<string>("");
  useEffect(() => {
    setactiveLink(pathname);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <nav className="fixed top-0 left-0 w-full  bg-blue-700 px-4 shadow-md z-50">
      <div className="container mx-auto flex   h-full items-center gap-4">
        <Link
          href="/"
          className={`text-white text-lg py-4 font-bold ${
            activeLink === "/" ? "border-b-1 border-white" : ""
          }`}
        >
          Robotic
        </Link>
        <Link
          href="/convertor"
          className={`text-white text-lg py-4 font-bold ${
            activeLink === "/convertor" ? "border-b-1 border-white" : ""
          }`}
        >
          Convertor
        </Link>
        <Link
          href="/section-constructor"
          className={`text-white text-lg py-4 font-bold ${
            activeLink === "/section-constructor"
              ? "border-b-1 border-white"
              : ""
          }`}
        >
          Section
        </Link>
        <Link
          href="/form-constructor"
          className={`text-white text-lg py-4 font-bold ${
            activeLink === "/form-constructor" ? "border-b-1 border-white" : ""
          }`}
        >
          Form
        </Link>
        <Link
          href="/next"
          className={`text-white text-lg py-4 font-bold h-full ${
            activeLink === "/next" ? "border-b-1 border-white" : ""
          }`}
        >
          Next
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
