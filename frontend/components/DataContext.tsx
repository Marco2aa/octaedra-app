// DataContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

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

type DataContextType = {
  ports: Port[];
  setPorts: React.Dispatch<React.SetStateAction<Port[]>>;
  infoUrl: InfoUrl | null;
  setInfoUrl: React.Dispatch<React.SetStateAction<InfoUrl | null>>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

type DataProviderProps = {
  children: ReactNode;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [infoUrl, setInfoUrl] = useState<InfoUrl | null>(null);

  return (
    <DataContext.Provider value={{ ports, setPorts, infoUrl, setInfoUrl }}>
      {children}
    </DataContext.Provider>
  );
};
