import { createContext, useContext, useState } from "react";

const RemoteContext = createContext<{
  mode: string;
  setMode: (mode: string) => void;
}>({
  mode: "tv",
  setMode: () => {},
});

export const RemoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState("tv");

  return (
    <RemoteContext.Provider
      value={{
        mode,
        setMode,
      }}
    >
      {children}
    </RemoteContext.Provider>
  );
};

export const useRemote = () => {
  const context = useContext(RemoteContext);

  if (context === undefined) {
    throw new Error("useRemote must be used within a RemoteProvider");
  }
  return context;
};
