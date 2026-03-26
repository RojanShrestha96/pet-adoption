import { Card } from "../ui/Card";
import { DollarSign, Activity, Users, PawPrint, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface AdminDonationCardsProps {
  data: {
    allTimeTotal: number;
    thisMonthTotal: number;
    thisMonthCount: number;
    avgDonationAmount: number;
    totalDonors: number;
    totalPetsHelped: number;
  };
}

export function AdminDonationCards({ data }: AdminDonationCardsProps) {
  // UX IMPROVEMENT: Admin donation analytics
  const cards = [
    {
      label: "Total Raised (All Time)",
      value: `Rs ${data.allTimeTotal.toLocaleString()}`,
      icon: Heart,
      color: "bg-pink-100 text-pink-600"
    },
    {
      label: "This Month",
      value: `Rs ${data.thisMonthTotal.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Donations This Month",
      value: `${data.thisMonthCount} donations`,
      icon: Activity,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Average Donation",
      value: `Rs ${data.avgDonationAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Calendar,
      color: "bg-amber-100 text-amber-600"
    },
    {
      label: "Total Donors",
      value: data.totalDonors,
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    {
      label: "Pets Helped",
      value: data.totalPetsHelped,
      icon: PawPrint,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((stat, index) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <Card
            className="p-4 transition-all border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: "var(--color-text)" }}>{stat.value}</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text-light)" }}>{stat.label}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
