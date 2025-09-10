import React from "react";
import { View, Text } from "react-native";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./card";

interface SkillDetail {
  score: number;
  description: string;
}

interface SkillAssessmentProps {
  skills?: Record<string, SkillDetail> | null;
}

export function SkillAssessment({ skills }: SkillAssessmentProps) {
  const validSkills = skills && typeof skills === "object" ? skills : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Assessment</CardTitle>
        <CardDescription>
          Evaluation of technical and soft skills based on interview responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="space-y-6">
          {Object.entries(validSkills).map(([skillName, { score = 0, description }]) => {
            const percentage = (score / 10) * 100;

            const scoreTextColor =
              percentage >= 70
                ? "text-green-600"
                : percentage >= 50
                ? "text-amber-600"
                : "text-red-600";

            const progressBarColor =
              percentage >= 85
                ? "bg-green-500"
                : percentage >= 70
                ? "bg-amber-500"
                : "bg-red-500";

            return (
              <View key={skillName} className="space-y-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium">{skillName}</Text>
                  <Text className={scoreTextColor}>{percentage}%</Text>
                </View>

                <View className="h-2 w-full rounded-full bg-gray-100">
                  <View
                    className={`h-2 rounded-full ${progressBarColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </View>

                <Text className="text-sm text-gray-500">{description}</Text>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}
