"use client";

import {
  Activity,
  PowerOff,
  RefreshCw,
  Settings,
  User,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { JSX } from "react";

// Configuração do dayjs para exibir datas relativas em português
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface ActivityEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  action: string;
  user?: string;
  timestamp: Date;
  icon: JSX.Element;
}

// Simulação de dados de atividades recentes
const mockActivities: ActivityEvent[] = [
  {
    id: "activity-001",
    deviceId: "dev-001",
    deviceName: "Projetor Principal",
    action: "Dispositivo ligado",
    user: "Carlos Silva",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    icon: <PowerOff className="h-4 w-4 text-green-500" />,
  },
  {
    id: "activity-002",
    deviceId: "dev-002",
    deviceName: "Ar-condicionado",
    action: "Configurações alteradas",
    user: "Ana Oliveira",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: <Settings className="h-4 w-4 text-blue-500" />,
  },
  {
    id: "activity-003",
    deviceId: "dev-003",
    deviceName: "Sensor de Presença",
    action: "Reiniciado automaticamente",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    icon: <RefreshCw className="h-4 w-4 text-amber-500" />,
  },
  {
    id: "activity-004",
    deviceId: "dev-005",
    deviceName: "Câmera de Segurança",
    action: "Firmware atualizado",
    user: "Sistema",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    icon: <Activity className="h-4 w-4 text-purple-500" />,
  },
];

export default function RecentActivity() {
  return (
    <div className="space-y-3">
      {mockActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0"
        >
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
            {activity.icon}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{activity.deviceName}</h4>
              <span className="text-xs text-slate-500">
                {dayjs(activity.timestamp).fromNow()}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{activity.action}</p>

            {activity.user && (
              <div className="flex items-center mt-1">
                <User className="h-3 w-3 text-slate-400 mr-1" />
                <span className="text-xs text-slate-500">{activity.user}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
