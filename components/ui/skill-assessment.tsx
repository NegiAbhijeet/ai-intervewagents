import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
          Evaluation of technical and soft skills based on interview responses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View style={styles.container}>
          {Object.entries(validSkills).length > 0 ? (
            Object.entries(validSkills).map(([skillName, { score = 0, description }]) => {
              const percentage = Math.min(Math.max((score / 10) * 100, 0), 100);

              const scoreTextColor =
                percentage >= 70
                  ? styles.textGreen
                  : percentage >= 50
                  ? styles.textAmber
                  : styles.textRed;

              const progressBarColor =
                percentage >= 85
                  ? styles.bgGreen
                  : percentage >= 70
                  ? styles.bgAmber
                  : styles.bgRed;

              return (
                <View key={skillName} style={styles.skillBlock}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skillName}</Text>
                    <Text style={[styles.scoreText, scoreTextColor]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>

                  <View style={styles.progressBackground}>
                    <View style={[styles.progressBar, progressBarColor, { width: `${percentage}%` }]} />
                  </View>

                  <Text style={styles.descriptionText}>{description || "No description provided."}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noSkillsText}>No skills data available.</Text>
          )}
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  skillBlock: {
    gap: 8,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillName: {
    fontWeight: "500",
    fontSize: 16,
    color: "#333",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "500",
  },
  textGreen: {
    color: "#16a34a", // green-600
  },
  textAmber: {
    color: "#d97706", // amber-600
  },
  textRed: {
    color: "#dc2626", // red-600
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#e5e7eb", // gray-200
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  bgGreen: {
    backgroundColor: "#22c55e", // green-500
  },
  bgAmber: {
    backgroundColor: "#f59e0b", // amber-500
  },
  bgRed: {
    backgroundColor: "#ef4444", // red-500
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280", // gray-500
  },
  noSkillsText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
