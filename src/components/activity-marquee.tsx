"use client";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

type Activity = {
    type: "earning" | "join" | "deposit";
    user: string;
    value?: string;
    text: string;
};

type ActivityResponse = {
    success: boolean;
    message: string;
    data: {
        items: Activity[];
    };
};
const dotColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
];

export function ActivityMarquee() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);

    const handleActivity = async () => {
        try {
            setLoading(true);

            const response: ActivityResponse = await apiFetch(
                "/user/activity-marquee",
                {
                    method: "GET",
                }
            );

            console.log("response", response);

            // Important: response.data.items
            setActivities(response.data.items);
        } catch (error) {
            console.error("Failed to fetch activity marquee:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleActivity();
    }, []);

    if (loading || !activities.length) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t bg-background">
            <div className="flex h-6 pb-0.5 items-center">
                <div className="animate-marquee flex w-max shrink-0 whitespace-nowrap">
                    {[...activities, ...activities].map((activity, index) => (
    <div
        key={`${activity.user}-${index}`}
        className="mx-6 inline-flex items-center gap-1 text-xs"
    >
        <span
            className={`h-2 w-2 rounded-full ${
                dotColors[index % dotColors.length]
            }`}
        />

        <span className="font-semibold text-foreground">
            {activity.user}
        </span>

        <span className="text-muted-foreground">
            {activity.text}
        </span>
    </div>
))}

                </div>
            </div>
        </div>
    );
}
