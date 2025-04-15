"use client";
import React, { useState } from "react";
import { useStateContext } from "@/components/StateProvider";

const Dashboard = () => {
  const { stone, setStone, handlerEnterStone, setOpenModal } =
    useStateContext();
  const handlerEnter = (name: string, input: string) => {
    handlerEnterStone(name, input);
  };
  const classes = [
    "best",
    "container",
    "bage",
    "block",
    "columns",
    "column",
    "cards",
    "card",
    "info",
    "item",
    "header",
    "footer",
    "form",
    "foo",
    "hero",
    "logo",
    "menu",
    "pagination",
    "plaza",
    "rel",
    "slider",
    "slide",
    "socs",
    "row",
    "title",
    "unit",
  ];
  return (
    <div
      className="dashboard rounded border border-gray-300 bg-gray-50 w-full"
      onMouseLeave={() => {
        setOpenModal(false);
      }}
      onMouseEnter={() => setStone([])}
    >
      <div>
        <div className="inline-flex  flex-col ">
          <span
            className="border border-gray-300 bg-gray-50 px-1 cursor-pointer inline-block"
            onMouseEnter={(e) => {
              handlerEnter("tag", e.currentTarget.textContent || "");
            }}
          >
            div
          </span>
          {classes &&
            classes.map((item, index) => {
              return (
                <span
                  key={index}
                  className="border border-gray-300 bg-gray-50 px-1 cursor-pointer inline-block"
                  onMouseEnter={(e) =>
                    handlerEnter("class", e.currentTarget.textContent || "")
                  }
                >
                  {item}
                </span>
              );
            })}

          {/* <span
            className="border border-gray-300 bg-gray-50 px-2 cursor-pointer inline-block"
            onMouseEnter={(e) =>
              handlerEnter(e.currentTarget.textContent || "")
            }
          >
            &quot;&gt;&lt;/div&gt;
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
