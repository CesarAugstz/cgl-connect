"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceList from "@/components/dashboard/device-list";
import DeviceStats from "@/components/dashboard/device-stats";
import LoadingSpinner from "@/components/loading-spinner";
import AlertsOverview from "@/components/dashboard/alerts-overview";
import RecentActivity from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              UFMT IoT Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-700">
                Welcome, nome do usuario
              </div>
              <button
                onClick={() => {
                  router.push("/login");
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-4">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="devices">Dispositivos</TabsTrigger>
                  <TabsTrigger value="alerts">Alertas</TabsTrigger>
                  <TabsTrigger value="analytics">Análises</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Suspense fallback={<LoadingSpinner />}>
                      <DeviceStats />
                    </Suspense>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Alertas Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<LoadingSpinner />}>
                          <AlertsOverview />
                        </Suspense>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Suspense fallback={<LoadingSpinner />}>
                          <RecentActivity />
                        </Suspense>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="devices" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Todos os Dispositivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<LoadingSpinner />}>
                        <DeviceList />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alerts">
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Alertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        Visualização detalhada de todos os alertas do sistema.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise de Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        Gráficos e análises de uso dos dispositivos ao longo do
                        tempo.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
