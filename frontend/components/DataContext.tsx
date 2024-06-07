// DataContext.tsx
import React, { ReactNode, createContext, useContext, useReducer } from "react";

type Port = {
  id_port: string;
  port: string;
  service: string;
  status: string;
  latency: number;
  updatedAt: string;
};

type InfoUrl = {
  avg_latency: number;
  dns_resolution_time: number;
  domain_creation_date: string;
  domain_expiration_date: string;
  icmp_version: number;
  ip_address: number;
  max_latency: number;
  min_latency: number;
  packet_sizes: number;
  packets_loss: number;
  packets_lost: number;
  packets_received: number;
  packets_sent: number;
  serial_number: string | null;
  server_version: string;
  ssl_issued_on: string;
  ssl_issuer: number;
  ttl: string;
  url_id: number;
};

type State = {
  ports: Port[];
  infoUrl: InfoUrl | null;
};

type Action =
  | { type: "SET_PORTS"; payload: Port[] }
  | { type: "SET_INFO_URL"; payload: InfoUrl };

const initialState: State = {
  ports: [],
  infoUrl: null,
};

const dataReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PORTS":
      return { ...state, ports: action.payload };
    case "SET_INFO_URL":
      return { ...state, infoUrl: action.payload };
    default:
      return state;
  }
};

type DataProviderProps = {
  children: ReactNode;
};

const DataContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
