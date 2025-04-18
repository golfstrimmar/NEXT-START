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
    <nav className="fixed top-0 left-0 w-full bg-blue-700 p-4 shadow-md z-50">
      <div className="container mx-auto flex  items-center gap-4">
        <Link href="/" className="text-white text-lg font-bold">
          Robotic
        </Link>
        <Link href="/convertor" className="text-white text-lg font-bold">
          Convertor
        </Link>
        <Link href="/plaza" className="text-white text-lg font-bold">
          Convertor
        </Link>
        {/* <Burger handlerburgerClick={() => setIsOpen(!isOpen)} isOpen={isOpen} /> */}
        {/* <ul className={`${styles["navbar-menu"]} ${isOpen ? styles.run : ""}`}>
          <li>
            <Link
              href="/"
              className={` hover:text-gray-300 transition-colors duration-200 ${
                activeLink === "/" ? "text-blue" : "text-white "
              }`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Home
            </Link>
          </li>
        </ul> */}
      </div>
    </nav>
  );
};

export default Navbar;
