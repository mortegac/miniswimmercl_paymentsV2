// import React, { useEffect } from "react";
// import IconTypeOfVehicle from "../../../../components/IconVehicles";

export interface Props {
  title: string;
  description: string;
}

export function HeaderTitle({
  title,
  description,
}: Props) {

  return (
    <>
      <div className="flex justify-between px-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-medium">{title}</h3>
          <span className="text-base font-light mt-2">{description}</span>
        </div>
       
      </div>
    </>
  );
}
