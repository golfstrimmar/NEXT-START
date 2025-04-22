"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStateContext } from "@/components/StateProvider";

const Dashboard = () => {
  const [name, setName] = useState<string>("div");
  const [className, setClassName] = useState<string>("");
  const [subClassName, setSubClassName] = useState<string>("");
  const [extraClass, setExtraClass] = useState<string>("");
  const { stone, setStone, handlerEnterStone } = useStateContext();
  const refTags = useRef<HTMLDivElement>(null);
  const refClasses = useRef<HTMLDivElement>(null);
  const refSubClasses = useRef<HTMLDivElement>(null);
  const refextraClasses = useRef<HTMLDivElement>(null);
  const handlerEnter = () => {
    handlerEnterStone(name, className, subClassName, extraClass);
    setName("div");
    setClassName("");
    setSubClassName("");
    setExtraClass("");
  };

  const tagsToShow = [
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

  const classesToShow = [
    "best",
    "container",
    "bages",
    "bage",
    "blocks",
    "block",
    "columns",
    "column",
    "cards",
    "card",
    "info",
    "items",
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
    "units",
    "unit",
  ];
  const extraclassesToShow = [
    "best",
    "container",
    "bages",
    "bage",
    "blocks",
    "block",
    "columns",
    "column",
    "cards",
    "card",
    "info",
    "items",
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
    "units",
    "unit",
  ];
  const subclassesToShow = [
    "__wrap",
    "__blocks",
    "__block",
    "__button",
    "__bage",
    "__content",
    "__columns",
    "__column",
    "__cards",
    "__card",
    "__decor",
    "__hidden",
    "__head",
    "__form",
    "__email",
    "__items",
    "__item",
    "__img",
    "__info",
    "__link",
    "__line",
    "__low",
    "__logo",
    "__pagination",
    "__plaza",
    "__slider",
    "__slide",
    "__socs",
    "__soc",
    "__title",
    "__text",
    "__top",
    "__phone",
    "__vidget",
    "__units",
    "__unit",
  ];

  return (
    <div className="fixed right-0 top-0 z-400">
      <p className="bg-red-400 flex items-center">
        &lt;{" "}
        <span className="inline-block min-w-[30px] text-[20px] text-center text-cyan-600">
          {name}
        </span>{" "}
        class="
        <span className="inline-block min-w-[30px] text-[20px] text-center  text-cyan-600">
          {className}
        </span>
        <span className="inline-block min-w-[30px] text-[20px] text-center  text-cyan-600">
          {subClassName}
        </span>
        <span className="inline-block min-w-[30px] text-[20px] text-center  text-cyan-600">
          &nbsp; {extraClass}
        </span>
        "&gt; &lt;/{name}&gt;
      </p>
      <div
        className="dashboard rounded border-[10px] bg-gray-50 w-full flex   pl-10 pt-4"
        style={{
          borderImage:
            "repeating-linear-gradient(-15deg, #000000 0 10px, #FFFF00 10px 20px) 10",
        }}
        onMouseLeave={() => {
          handlerEnter();
          refTags.current.style.transform = "scale(1)";
          refClasses.current.style.transform = "scale(1)";
          refSubClasses.current.style.transform = "scale(1)";
          refextraClasses.current.style.transform = "scale(1)";
        }}
      >
        <div className="flex   gap-10">
          <div className="inline-flex   flex-col" ref={refTags}>
            {tagsToShow &&
              tagsToShow.map((item, index) => {
                return (
                  <span
                    key={index}
                    className={`text-sm border border-gray-300  px-1 py-0.5 cursor-pointer inline-block whitespace-nowrap ${
                      index === 0
                        ? "bg-slate-700 px-4 text-white"
                        : "bg-slate-400"
                    }`}
                    onMouseEnter={(e) => {
                      setName(e.currentTarget.textContent || "");
                      refTags.current.style.transform = "scale(0)";
                    }}
                  >
                    {item}
                  </span>
                );
              })}
          </div>

          <div className="inline-flex    flex-col " ref={refClasses}>
            {classesToShow &&
              classesToShow.map((item, index) => {
                return (
                  <span
                    key={index}
                    className={`border text-[14px] border-gray-300  px-1 cursor-pointer inline-block ${
                      index === 0
                        ? "bg-green-700 px-4 text-white"
                        : "bg-green-400"
                    }`}
                    onMouseEnter={(e) => {
                      setClassName(e.currentTarget.textContent || "");
                      refClasses.current.style.transform = "scale(0)";
                    }}
                  >
                    {item}
                  </span>
                );
              })}
          </div>
          <div className="inline-flex   flex-col " ref={refSubClasses}>
            {subclassesToShow &&
              subclassesToShow.map((item, index) => {
                return (
                  <span
                    key={index}
                    className="border text-[14px] text-bold border-gray-300 bg-indigo-300 px-1 cursor-pointer inline-block  "
                    onMouseEnter={(e) => {
                      setSubClassName(e.currentTarget.textContent || "");
                      refSubClasses.current.style.transform = "scale(0)";
                    }}
                  >
                    {item}
                  </span>
                );
              })}
          </div>
          <div className="inline-flex  flex-col " ref={refextraClasses}>
            {extraclassesToShow &&
              extraclassesToShow.map((item, index) => {
                return (
                  <span
                    key={index}
                    className="border text-[14px] border-gray-300 bg-violet-300 px-1 cursor-pointer inline-block"
                    onMouseEnter={(e) => {
                      setExtraClass(e.currentTarget.textContent || "");
                      refextraClasses.current.style.transform = "scale(0)";
                    }}
                  >
                    {item}
                  </span>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
