"use client";

import EmployeeDashboard from "./employee-dashboard";
import CompanyBalancesDashboard from "./company-balances-dashboard";

const ADMIN_WALLETS = [
  "0x12745b393D63072ba400d943Ce9657f82C7f4522",
  "0x5d262ad5f60189bb21eb6cf6bca7db04f2c01518",
].map((a) => a.toLowerCase());

export default function DashboardSwitcher({ addr }: { addr?: string }) {
  if (addr && ADMIN_WALLETS.includes(addr.toLowerCase())) {
    return <CompanyBalancesDashboard key="company" />;
  }
  return <EmployeeDashboard key={addr ?? "employee"} />;
}
