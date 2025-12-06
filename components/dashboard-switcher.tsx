"use client";

import EmployeeDashboard from "./employee-dashboard";
import CompanyBalancesDashboard from "./company-balances-dashboard";

const ADMIN_WALLET = "0x12745b393D63072ba400d943Ce9657f82C7f4522".toLowerCase();

export default function DashboardSwitcher({ addr }: { addr?: string }) {
  if (addr === ADMIN_WALLET) {
    return <CompanyBalancesDashboard key="company" />;
  }
  return <EmployeeDashboard key={addr ?? "employee"} />;
}
