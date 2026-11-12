import fs from 'node:fs';
import path from 'node:path';

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
} from '@playwright/test/reporter';

class RunReporter implements Reporter {
  private suite?: Suite;
  private startedAt = '';

  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
    this.startedAt = new Date().toISOString();

    console.log('\nStarting price tracker run monitoring...');
  }

  onEnd(result: FullResult): void {
    if (!this.suite) {
      return;
    }

    const tests = this.suite.allTests().map((test) => {
      const lastResult = test.results.at(-1);
      const wasExecuted = test.results.length > 0;

      return {
        title: test.title,
        file: test.location.file,
        outcome: wasExecuted ? test.outcome() : 'not-run',
        durationMs: lastResult?.duration ?? 0,
        retryCount: Math.max(0, test.results.length - 1),
        error: lastResult?.error?.message ?? null,
      };
    });

    const executedTests = tests.filter((test) => test.outcome !== 'not-run');

    const flaky = tests.filter((test) => test.outcome === 'flaky').length;

    const summary = {
      startedAt: this.startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(this.startedAt).getTime(),
      runStatus: result.status,

      totals: {
        discovered: tests.length,
        total: executedTests.length,
        passed: tests.filter(
          (test) => test.outcome === 'expected' || test.outcome === 'flaky',
        ).length,
        failed: tests.filter((test) => test.outcome === 'unexpected').length,
        skipped: tests.filter((test) => test.outcome === 'skipped').length,
        interrupted: tests.filter((test) => test.outcome === 'interrupted')
          .length,
        notRun: tests.filter((test) => test.outcome === 'not-run').length,
        flaky,
      },

      tests,
    };

    const outputDirectory = path.join(process.cwd(), 'test-results');

    const historyDirectory = path.join(process.cwd(), 'run-history');

    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.mkdirSync(historyDirectory, { recursive: true });

    // Save the latest run summary
    const outputPath = path.join(outputDirectory, 'run-summary.json');

    // Save a permanent copy of this run
    const timestamp = this.startedAt.replace(/[:.]/g, '-');

    const historyPath = path.join(historyDirectory, `run-${timestamp}.json`);

    const summaryJson = JSON.stringify(summary, null, 2);

    fs.writeFileSync(outputPath, summaryJson);
    fs.writeFileSync(historyPath, summaryJson);

    console.log('\nPrice Tracker Run Summary');
    console.log('-------------------------');
    console.log(`Discovered:  ${summary.totals.discovered}`);
    console.log(`Executed:    ${summary.totals.total}`);
    console.log(`Passed:      ${summary.totals.passed}`);
    console.log(`Failed:      ${summary.totals.failed}`);
    console.log(`Skipped:     ${summary.totals.skipped}`);
    console.log(`Not run:     ${summary.totals.notRun}`);
    console.log(`Interrupted: ${summary.totals.interrupted}`);
    console.log(`Flaky:       ${summary.totals.flaky}`);

    const minutes = Math.floor(summary.durationMs / 60000);
    const seconds = Math.floor((summary.durationMs % 60000) / 1000);

    console.log(`Duration:    ${minutes}m ${seconds}s`);
    console.log(`Status:      ${summary.runStatus}`);
    console.log(`\nSummary saved to: ${outputPath}`);
    console.log(`Run history saved to: ${historyPath}`);
  }
}

export default RunReporter;
