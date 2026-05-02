import React from "react";
import { Composition } from "remotion";
import { OccupancyInstitute } from "./compositions/OccupancyInstitute";

// Register all Remotion compositions here.
// To add a new video: import the component and add a <Composition /> below.
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="OccupancyInstitute"
        component={OccupancyInstitute}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
