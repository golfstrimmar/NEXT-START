"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/components/StateProvider";

const Dashboard = () => {
  const { stone, setStone, handlerEnterStone, setOpenModal } =
    useStateContext();
  const handlerEnter = (name: string, input: string) => {
    handlerEnterStone(name, input);
  };

  useEffect(() => {
    console.log("<====dashboard stone====>", stone);
  }, [stone]);

  const tags = [
    "div",
    "a",
    "button",
    "br",
    "img",
    "header",
    "footer",
    "li",
    "mark",
    "main",
    "nav",
    "ol",
    "p",
    "span",
    "section",
    "hr",
    "ul",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ];
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
          {tags &&
            tags.map((item, index) => {
              return (
                <span
                  key={index}
                  className="border border-gray-300 bg-gray-50 px-1 cursor-pointer inline-block"
                  onMouseEnter={(e) =>
                    handlerEnter("tag", e.currentTarget.textContent || "")
                  }
                >
                  {item}
                </span>
              );
            })}
        </div>
        <div className="inline-flex  flex-col ">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
