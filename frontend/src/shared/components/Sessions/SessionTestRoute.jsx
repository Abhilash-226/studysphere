import React from "react";
import { useParams } from "react-router-dom";

const SessionTestRoute = () => {
  const { sessionId } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Session Test Route</h1>
      <p>
        Session ID from URL: <strong>{sessionId || "undefined"}</strong>
      </p>
      <p>
        Params object: <pre>{JSON.stringify(useParams(), null, 2)}</pre>
      </p>
    </div>
  );
};

export default SessionTestRoute;
