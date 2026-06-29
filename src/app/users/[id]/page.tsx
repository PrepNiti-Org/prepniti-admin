import React from "react";
import UserDashboardClient from "./UserDashboardClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserDashboardPage({ params }: PageProps) {
    const resolvedParams = await params;
    return <UserDashboardClient id={resolvedParams.id} />;
}
