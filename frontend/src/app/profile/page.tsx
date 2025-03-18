"use client";
import React, { useState, useEffect } from "react";
import "./Profile.scss";
import { useSelector } from "react-redux";
import Link from "next/link";
import Click from "@/assets/svg/click.svg";

interface User {
  _id?: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface Bid {
  user: { _id: string; userName: string };
  amount: number;
  timestamp: string;
}

interface Auction {
  _id: string;
  title: string;
  startPrice: number;
  endTime: string;
  imageUrl: string;
  status: string;
  creator: { _id: string; userName: string };
  currentBid?: number;
  bids: Bid[];
  winner?: { user: string; amount: number };
}

interface ProfileData {
  user: { userName: string };
  createdAuctions: Auction[];
  auctionsWithBids: Auction[];
  wonAuctions: Auction[];
}

const Profile: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user as User);
  const socket = useSelector((state: any) => state.socket.socket);
  const token = useSelector((state: any) => state.auth.token);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (socket && token) {
      socket.emit("getProfileData", { token });

      socket.on("profileData", (data: ProfileData) => {
        setProfileData(data);
      });

      socket.on("profileError", (message: string) => {
        setError(message);
      });

      return () => {
        socket.off("profileData");
        socket.off("profileError");
      };
    }
  }, [socket, token]);

  return (
    <div className="profile">
      <div className="border border-gray-200 rounded-2xl overflow-hidden  shadow-[0_0_8px_rgba(0,0,0,0.1)]">
        <div className="bg-[#f8f9fa] p-2 text-center border-b border-[#e9ecef]">
          <h2 className="text-2xl text-[#212529] font-semibold m-4">
            {user?.userName}
          </h2>
          <div className="w-30 h-30 mx-auto rounded-full overflow-hidden">
            {user?.avatar ? (
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
          <div className="p-3 flex flex-col gap-2">
            <div className="">
              <label className="italic text-[#6c757d]">Email:</label>
              <p className="">{user?.email}</p>
            </div>

            <div className="">
              <label className="italic text-[#6c757d]">User ID:</label>
              <p className="">{user?._id}</p>
            </div>

            <div className="">
              <label className="italic text-[#6c757d]">Member since:</label>
              <p className="">
                {" "}
                {new Date(user?.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {error && <p className="profile-error">{error}</p>}
          </div>
        ) : (
          <div className="profile-loading">Loading user data...</div>
        )}
      </div>
    </div>
  );
};

export default Profile;
