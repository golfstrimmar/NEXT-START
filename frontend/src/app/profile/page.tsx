"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
// =================================

// =================================
const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "loading") return null;

  // ==============================
  return (
    <div className="profile ">
      <div className=" mx-auto max-w-7xl my-4">
        {session ? (
          <>
            <div className="border border-gray-200 rounded-2xl overflow-hidden  shadow-[0_0_8px_rgba(0,0,0,0.1)]">
              <div className="bg-[#f8f9fa] p-2 text-center border-b border-[#e9ecef]">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
                  Profile
                </h2>
              </div>
              <div className="p-8 flex flex-col items-center">
                <img
                  src={session.user?.image}
                  alt="Profile"
                  className="w-[150px] h-[150px] rounded-full"
                />
                <div className="mt-4 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.user?.name}
                  </h3>
                  <p className="text-gray-600">{session.user?.email}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Profile;
