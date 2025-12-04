export const runtime = "nodejs";

type Employee = {
  id: string;
  name: string;
  wallet: string;
  totalBalanceUsd: number;
};

const employees: Employee[] = [
  {
    id: "emp-001",
    name: "Alice Johnson",
    wallet: "0x12745b393D63072ba400d943Ce9657f82C7f4522",
    totalBalanceUsd: 1245.5,
  },
  {
    id: "emp-002",
    name: "Bob Smith",
    wallet: "0xB0b0000000000000000000000000000000000000",
    totalBalanceUsd: 865.75,
  },
  {
    id: "emp-003",
    name: "Carol Nguyen",
    wallet: "0xCaRol00000000000000000000000000000000000",
    totalBalanceUsd: 432.12,
  },
];

export async function GET() {
  return Response.json({ employees });
}
