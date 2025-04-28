import DashboardDetail from "@/components/dashboard/dashboard-detail";

export default async function DashboardDetailPage({ params }: any){
  const {dashboardId} = (await params)

  return (
    <DashboardDetail id={dashboardId} />
  )

}
