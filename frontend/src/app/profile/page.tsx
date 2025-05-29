"use client";
import React, { useState, useEffect } from "react";
import "./Profile.scss";
import { useSelector } from "react-redux";
import Link from "next/link";
import ChevronLeft from "@/components/icons/ChevronLeft";
import User from "@/types/user";

const Profile: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user as User);

  return (
    <div className="profile">
      <Link
        href="/"
        className="hover:bg-slate-200 hover:text-slate-600 text-slate-400 transition-all duration-200 ease-in-out inline-flex items-center gap-2 p-2  rounded-md mb-4"
      >
        <ChevronLeft className="w-4 h-4 " /> Go to chat
      </Link>
      <div className="border border-gray-200 rounded-2xl overflow-hidden  shadow-[0_0_8px_rgba(0,0,0,0.1)]">
        <div className="bg-[#f8f9fa] p-2 text-center border-b border-[#e9ecef]">
          <h2 className="text-2xl text-[#212529] font-semibold m-4">
            {user?.userName}
          </h2>
          <div className="w-30 h-30 mx-auto rounded-full overflow-hidden">
            {user?.avatar !== "" ? (
              <img
                src={user?.avatar}
                alt="User avatar"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-[#4a90e2] text-white flex items-center justify-center text-2xl ">
                {user?.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {user ? (
          <div className="p-3 flex flex-col gap-2 items-center">
            <div className="">
              <label className="italic text-[#6c757d]">
                Email: <span className="">{user?.email}</span>
              </label>
            </div>

            <div className="">
              <label className="italic text-[#6c757d]">
                User ID: <span className="">{user?._id}</span>
              </label>
            </div>

            <div className="">
              <label className="italic text-[#6c757d]">
                Member since:{" "}
                <span>
                  {new Date(user?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="profile-loading">Loading user data...</div>
        )}
      </div>
    </div>
  );
};

export default Profile;
