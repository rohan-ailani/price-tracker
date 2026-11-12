import fs from 'node:fs';
import path from 'node:path';

interface TestResult {
  title: string;
  file: string;
  outcome: string;
  durationMs: number;
  retryCount: number;
  error: string | null;
}

interface RunSummary {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  runStatus: string;
  totals: {
    discovered: number;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    interrupted: number;
    notRun: number;
    flaky: number;
  };
  tests: TestResult[];
}

const historyDirectory = path.join(process.cwd(), 'run-history');

const reportDirectory = path.join(process.cwd(), 'reports');

if (!fs.existsSync(historyDirectory)) {
  throw new Error('Run history directory does not exist.');
}

const historyFiles = fs
  .readdirSync(historyDirectory)
  .filter((file) => file.endsWith('.json'));

if (historyFiles.length === 0) {
  throw new Error('No historical run files found.');
}

const runs: RunSummary[] = historyFiles
  .map((file) => {
    const filePath = path.join(historyDirectory, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    return JSON.parse(content) as RunSummary;
  })
  .sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

const totalRuns = runs.length;

const totalTests = runs.reduce((sum, run) => sum + run.totals.total, 0);

const totalPassed = runs.reduce((sum, run) => sum + run.totals.passed, 0);

const totalFailed = runs.reduce((sum, run) => sum + run.totals.failed, 0);

const totalFlaky = runs.reduce((sum, run) => sum + run.totals.flaky, 0);

const averageDurationMs =
  runs.reduce((sum, run) => sum + run.durationMs, 0) / totalRuns;

const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

const failureRate = totalTests > 0 ? (totalFailed / totalTests) * 100 : 0;

// Identify tests that failed in multiple runs
const testFailureCounts = new Map<
  string,
  { title: string; file: string; failures: number }
>();

for (const run of runs) {
  for (const test of run.tests) {
    if (test.outcome !== 'unexpected') {
      continue;
    }

    const key = `${test.file}::${test.title}`;
    const existing = testFailureCounts.get(key);

    if (existing) {
      existing.failures += 1;
    } else {
      testFailureCounts.set(key, {
        title: test.title,
        file: test.file,
        failures: 1,
      });
    }
  }
}

const recurringFailures = Array.from(testFailureCounts.values())
  .filter((test) => test.failures > 1)
  .sort((a, b) => b.failures - a.failures);

const report = {
  generatedAt: new Date().toISOString(),

  overview: {
    totalRuns,
    totalTests,
    totalPassed,
    totalFailed,
    totalFlaky,
    passRate: Number(passRate.toFixed(2)),
    failureRate: Number(failureRate.toFixed(2)),
    averageDurationMs: Math.round(averageDurationMs),
  },

  recurringFailures,

  runs: runs.map((run) => ({
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    runStatus: run.runStatus,
    durationMs: run.durationMs,
    totals: run.totals,
  })),
};

fs.mkdirSync(reportDirectory, { recursive: true });

const reportPath = path.join(reportDirectory, 'trend-report.json');

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

const markdownPath = path.join(reportDirectory, 'trend-report.md');

const runRows = [...runs]
  .reverse()
  .map(
    (run) =>
      `| ${run.startedAt} | ${run.runStatus} | ${run.totals.passed} | ${run.totals.failed} | ${run.totals.flaky} | ${(run.durationMs / 1000).toFixed(2)}s |`,
  )
  .join('\n');

const failureRows =
  recurringFailures.length > 0
    ? recurringFailures
        .map((test) => `| ${test.title} | ${test.file} | ${test.failures} |`)
        .join('\n')
    : '| No recurring failures | - | 0 |';

const markdownReport = `# Price Tracker Trend Report

**Generated:** ${report.generatedAt}

## Overall Summary

| Metric | Value |
|---|---:|
| Total runs | ${totalRuns} |
| Total executed tests | ${totalTests} |
| Passed | ${totalPassed} |
| Failed | ${totalFailed} |
| Flaky | ${totalFlaky} |
| Pass rate | ${passRate.toFixed(2)}% |
| Failure rate | ${failureRate.toFixed(2)}% |
| Average duration | ${(averageDurationMs / 1000).toFixed(2)} seconds |

## Run History

| Started | Status | Passed | Failed | Flaky | Duration |
|---|---|---:|---:|---:|---:|
${runRows}

## Recurring Failures

| Test | File | Failure Count |
|---|---|---:|
${failureRows}
`;

fs.writeFileSync(markdownPath, markdownReport);

console.log('\nPrice Tracker Trend Report');
console.log('--------------------------');
console.log(`Total runs:       ${totalRuns}`);
console.log(`Total tests:      ${totalTests}`);
console.log(`Passed:           ${totalPassed}`);
console.log(`Failed:           ${totalFailed}`);
console.log(`Flaky:            ${totalFlaky}`);
console.log(`Pass rate:        ${passRate.toFixed(2)}%`);
console.log(`Failure rate:     ${failureRate.toFixed(2)}%`);
console.log(
  `Average duration: ${(averageDurationMs / 1000).toFixed(2)} seconds`,
);

console.log(`\nRecurring failures: ${recurringFailures.length}`);

console.log(`Markdown report saved to: ${markdownPath}`);
