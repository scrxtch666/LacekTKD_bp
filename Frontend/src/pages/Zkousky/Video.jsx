import React from "react";

function Video({ belt }) {
  if (!belt?.video_path) return null;

  return (
    <div className="bg-customWhite w-full rounded-lg p-2">
      <iframe
        src={belt.video_path}
        title={belt.belt_name}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full aspect-video rounded-lg"
      ></iframe>
    </div>
  );
}

export default Video;