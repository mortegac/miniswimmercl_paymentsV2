import React from "react";
import LoadingIcon from "@/components/Base/LoadingIcon";
import {Logo_animate} from "./Logo_animate";

const Splash: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-primary">
      <Logo_animate />
      <LoadingIcon
        icon="bars"
        color="#ffffff"
        className="-mt-16 ml-48 w-24 h-24"
      />
    </div>
  );
};

export default Splash;
