import Link from "next/link";

export function DashboardCard({
  href,
  eyebrow,
  title,
  description
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link className="dashboard-card" href={href}>
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="inline-link">Open</span>
    </Link>
  );
}
