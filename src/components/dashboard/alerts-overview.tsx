"use client";

import { Thermometer, WifiOff, Zap } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { JSX } from "react";

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  type: "error" | "warning";
  message: string;
  timestamp: Date;
  icon: JSX.Element;
}

// Mock data for demonstration
const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    deviceId: "dev-002",
    deviceName: "Ar-condicionado",
    location: "Sala 102 - Bloco A",
    type: "warning",
    message: "Temperatura acima do normal",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    icon: <Thermometer className="h-5 w-5 text-amber-500" />,
  },
  {
    id: "alert-002",
    deviceId: "dev-004",
    deviceName: "Smart Board",
    location: "Sala 201 - Bloco B",
    type: "error",
    message: "Dispositivo offline há 2 dias",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: <WifiOff className="h-5 w-5 text-red-500" />,
  },
  {
    id: "alert-003",
    deviceId: "dev-005",
    deviceName: "Câmera de Segurança",
    location: "Corredor - Bloco B",
    type: "warning",
    message: "Bateria fraca",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    icon: <Zap className="h-5 w-5 text-amber-500" />,
  },
];

export default function AlertsOverview() {
  return (
    <div className="space-y-4">
      {mockAlerts.length > 0 ? (
        <div className="space-y-3">
          {mockAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start p-3 rounded-lg border ${
                alert.type === "error" 
                  ? "bg-red-50 border-red-200" 
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="mr-3">{alert.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{alert.deviceName}</h4>
                  <span className="text-xs text-slate-500">{dayjs(alert.timestamp).fromNow()}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                <p className="text-xs text-slate-500 mt-1">{alert.location}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500">
          <p>Nenhum alerta recente</p>
        </div>
      )}
    </div>
  );
}
