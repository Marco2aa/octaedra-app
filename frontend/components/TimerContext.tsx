import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";

type TimerContextType = {
  triggerFunctions: () => void;
  subscribeToTimerEnd: (callback: () => void) => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerContext must be used within a TimerProvider");
  }
  return context;
};

type TimerProviderProps = {
  children: ReactNode;
};

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [trigger, setTrigger] = useState(false);
  const callbacksRef = useRef<Array<() => void>>([]);

  const triggerFunctions = () => {
    setTrigger((prev) => !prev);
    callbacksRef.current.forEach((callback) => callback());
  };

  const subscribeToTimerEnd = (callback: () => void) => {
    callbacksRef.current.push(callback);
  };

  return (
    <TimerContext.Provider value={{ triggerFunctions, subscribeToTimerEnd }}>
      {children}
    </TimerContext.Provider>
  );
};
