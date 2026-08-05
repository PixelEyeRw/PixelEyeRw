import React from "react";
import OMApp from "../OM/App";

export default function DirectorApp({ onSignOut }) {
  // Director reuses the OM app but with broader scope; pass a flag
  return <OMApp onSignOut={onSignOut} isDirector />;
}
