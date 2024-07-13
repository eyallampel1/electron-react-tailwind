import React from "react";

export default function MyComp({counter}) {
  return (
      <div className={"mt-3"}>
          <div className={"flex justify-center"}>
              <h1 className={"font-bold bg-blue-500 w-screen text-center"}>MyComp.jsx being called from App.jsx</h1>
          </div>
          <div className={"bg-blue-500 w-screen text-3xl font-bold"}>Counter is : {counter}</div>
      </div>
  );
}