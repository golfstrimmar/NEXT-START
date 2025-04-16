"use client";
import React, { useState, useEffect, useRef } from "react";
import { useStateContext } from "@/components/StateProvider";

const Dashboard = () => {
  const [name, setName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [subClassName, setSubClassName] = useState<string>("");
  const [extraClass, setExtraClass] = useState<string>("");
  const { stone, setStone, handlerEnterStone } = useStateContext();
  const refTags = useRef<HTMLDivElement>(null);
  const refClasses = useRef<HTMLDivElement>(null);
  const refSubClasses = useRef<HTMLDivElement>(null);
  const refextraClasses = useRef<HTMLDivElement>(null);
  const handlerEnter = () => {
    console.log("<====enter====>");
    handlerEnterStone(name, className, subClassName, extraClass);
    setName("");
    setClassName("");
    setSubClassName("");
    setExtraClass("");
  };

  useEffect(() => {
    console.log(
      "handlerEnter",
      "name:",
      name,
      "className:",
      className,
      "subClassName",
      subClassName,
      "extraClass",
      extraClass
    );
  }, [name, className, subClassName, extraClass]);

  const tags = [
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
    "div",
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
  const extraclasses = [
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
  const subclasses = [
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
    <div
      className="dashboard rounded border border-gray-300 bg-gray-50 w-full"
      // onMouseLeave={() => {
      //   setOpenModal(false);
      // }}
      onMouseLeave={() => {
        handlerEnter();
        refTags.current.style.transform = "scale(1)";
        refClasses.current.style.transform = "scale(1)";
        refSubClasses.current.style.transform = "scale(1)";
        refextraClasses.current.style.transform = "scale(1)";
      }}
    >
      <p>
        &lt;{" "}
        <span className="inline-block min-w-[30px] text-[12px] text-center text-cyan-600">
          {name}
        </span>{" "}
        class="
        <span className="inline-block min-w-[30px] text-[12px] text-center  text-cyan-600">
          {className}
        </span>
        <span className="inline-block min-w-[30px] text-[12px] text-center  text-cyan-600">
          {subClassName}
        </span>
        <span className="inline-block min-w-[30px] text-[12px] text-center  text-cyan-600">
          &nbsp; {extraClass}
        </span>
        "&gt; &lt;/{name}&gt;
      </p>

      <div className="flex justify-between">
        <div className="inline-flex  flex-col " ref={refTags}>
          {tags &&
            tags.map((item, index) => {
              return (
                <span
                  key={index}
                  className={`${
                    index === 10 ? "py-4 bg-white" : ""
                  } border border-gray-300 bg-slate-400 px-1 cursor-pointer inline-block`}
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

        <div className="inline-flex  flex-col " ref={refClasses}>
          {classes &&
            classes.map((item, index) => {
              return (
                <span
                  key={index}
                  className="border border-gray-300 bg-green-400 px-1 cursor-pointer inline-block"
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
        <div className="inline-flex  flex-col " ref={refSubClasses}>
          {subclasses &&
            subclasses.map((item, index) => {
              return (
                <span
                  key={index}
                  className="border border-gray-300 bg-indigo-300 px-1 cursor-pointer inline-block"
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
          {extraclasses &&
            extraclasses.map((item, index) => {
              return (
                <span
                  key={index}
                  className="border border-gray-300 bg-violet-300 px-1 cursor-pointer inline-block"
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
  );
};

export default Dashboard;
