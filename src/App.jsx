import React, {useState} from "react";
import MyComp from "./components/MyComp.jsx";

export default function App() {
    const [counter, setCounter] = useState(0)
  return (
    <div>
        <div className={"flex justify-center"}>
            <h1 className={"font-bold bg-red-500 w-screen text-center"}>App.jsx</h1>
        </div>
        <button onClick={()=>{setCounter(counter+1)}} className={"text-white bg-green-500 mt-3 w-32 h-8 hover:bg-green-200"}>Click Me</button>
   <MyComp counter={counter} />
    </div>
  );
}