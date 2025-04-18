"use client";
import React, { useEffect, useState } from "react";
// import HomeImg from "@/assets/svg/home.svg";
// import Image from "next/image";
// import IMG10 from "@/assets/images/15.jpg";

import Dashboard from "@/components/Dashboard/Dashboard";
import Plaza from "@/app/plaza/page";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { useStateContext } from "@/components/StateProvider";

export default function Home() {
  // const [error, setError] = useState<string>("");
  // const { stone, handlerEnterStone } = useStateContext();

  // useEffect(() => {
  //   console.log("<====stone====>", stone);
  //   if (stone.length > 0) {
  //     setError(
  //       stone.map((item, index) => {
  //         return (
  //           <div key={index}>
  //             <span>{item.name}</span>: <span>{item.value}</span>
  //           </div>
  //         );
  //       })
  //     );
  //     setOpenModal(true);
  //   }
  // }, [stone]);

  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      <div>
        {/* <HomeImg className="inline-block mr-2 w-8 h-8"></HomeImg> */}

        <div className="grid grid-cols-[1fr_25%] gap-2">
          {/* {error && <ModalMessage message={error} open={openModal} />} */}

          <Plaza />
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
