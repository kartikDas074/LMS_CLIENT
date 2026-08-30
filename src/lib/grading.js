export function getGrade(percentage) {
  const value = Number(percentage) || 0;

  if (value >= 90) return "A+";
  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  return "F";
}

export function normalizePercentage(value) {
  const numeric = Number(value) || 0;
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
}

export function formatPercentage(value) {
  const numeric = normalizePercentage(value);
  return `${Math.round(numeric)}%`;
}

export function getQuizResultSummary({ result = 0, totalMarks = 0, percentage } = {}) {
  const numericResult = Number(result) || 0;
  const numericTotalMarks = Number(totalMarks) || 0;
  const derivedPercentage = numericTotalMarks > 0
    ? Number(((numericResult / numericTotalMarks) * 100).toFixed(2))
    : 0;

  const normalizedPercentage = normalizePercentage(
    Number.isFinite(Number(percentage)) ? Number(percentage) : derivedPercentage
  );

  return {
    result: numericResult,
    totalMarks: numericTotalMarks,
    percentage: normalizedPercentage,
    grade: getGrade(normalizedPercentage),
    passed: normalizedPercentage >= 50,
  };
}
