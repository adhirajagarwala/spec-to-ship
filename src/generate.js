export function generatePlan(notes) {
  const lines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    summary: lines[0] || "New project idea",
    problem: lines.slice(0, 2).join(" "),
    goals: lines.slice(0, 3).map((line) => `Clarify: ${line}`),
    tasks: lines.map((line, index) => ({
      id: `task-${index + 1}`,
      title: line.replace(/^[-*]\s*/, ""),
      status: "draft"
    })),
    openQuestions: [
      "What is the success metric for this project?",
      "What is the smallest launchable slice?"
    ]
  };
}
