import { h, render, Component } from "preact";
import stats from "stats-lite";

import BenchmarkRunner from "./benchmarkRunner";

import "./index.css";

console.log("AmpBenchmarkIife!");

// Run our benchamrks
const benchmarkRunner = new BenchmarkRunner();
benchmarkRunner.generateMutations(200);
benchmarkRunner.runAllMutations();
benchmarkRunner.generateMutations(200);
benchmarkRunner.runAllMutations(true);

const getTableHeadings = resultCategoryKey => {
  const tableHeadings = [];

  if (
    !benchmarkRunner.mutationResults ||
    !benchmarkRunner.mutationResults[resultCategoryKey]
  ) {
    return tableHeadings;
  }

  Object.keys(benchmarkRunner.mutationResults[resultCategoryKey]).forEach(
    key => {
      tableHeadings.push(<th>{key}</th>);
    }
  );

  return tableHeadings;
};

const getResultsTableRow = (
  name,
  resultCategoryKey,
  statsCallback,
  stopConvertToMilliSeconds
) => {
  const statsTableCells = [];

  Object.keys(benchmarkRunner.mutationResults[resultCategoryKey]).forEach(
    key => {
      const times = [];

      benchmarkRunner.mutationResults[resultCategoryKey][key].forEach(
        result => {
          times.push(result.time);
        }
      );

      let result = statsCallback(times);

      // Ooooo this some top quality code right here
      if (!stopConvertToMilliSeconds) {
        result = result / 1000;
      }

      // Divide by 1000 to get milliseconds
      statsTableCells.push(<td>{result}</td>);
    }
  );

  const tableRow = (
    <tr>
      <td>{name}</td>
      {statsTableCells}
    </tr>
  );

  return tableRow;
};

const getResultTableRows = resultCategoryKey => {
  const tableRows = [];

  if (
    !benchmarkRunner.mutationResults ||
    !benchmarkRunner.mutationResults[resultCategoryKey]
  ) {
    return tableRows;
  }

  tableRows.push(
    getResultsTableRow(
      "Total Ran",
      resultCategoryKey,
      array => {
        return array.length;
      },
      true
    )
  );
  tableRows.push(getResultsTableRow("Sum", resultCategoryKey, stats.sum));
  tableRows.push(
    getResultsTableRow("Mean (Average)", resultCategoryKey, stats.mean)
  );
  tableRows.push(getResultsTableRow("Median", resultCategoryKey, stats.mean));
  tableRows.push(getResultsTableRow("Mode", resultCategoryKey, stats.mode));
  tableRows.push(
    getResultsTableRow("Variance", resultCategoryKey, stats.variance)
  );
  tableRows.push(
    getResultsTableRow("Standard Deviation", resultCategoryKey, stats.stdev)
  );

  return tableRows;
};

// Render the results
class App extends Component {
  render() {
    return (
      <div class="amp-benchmark">
        <h1>AMP Benchmark</h1>
        <button onclick={() => benchmarkRunner.runMutation()}>
          (Debug) Run Mutation
        </button>

        <h2>Results</h2>
        <div>
          <i>Results recorded in microseconds, and converted to milliseconds</i>
        </div>
        <div>Total Mutations run: {benchmarkRunner.getTotalMutationsRun()}</div>

        <h3>Not Purified</h3>

        <table class="value-table">
          <thead>
            <tr>
              <th>Statistic</th>
              {getTableHeadings("notSanitized")}
            </tr>
          </thead>
          <tbody>{getResultTableRows("notSanitized")}</tbody>
        </table>

        <h3>Purified</h3>

        <table class="value-table">
          <thead>
            <tr>
              <th>Statistic</th>
              {getTableHeadings("sanitized")}
            </tr>
          </thead>
          <tbody>{getResultTableRows("sanitized")}</tbody>
        </table>
      </div>
    );
  }
}

// Find the first child of the body
const benchmarkContainer = document.createElement("div");
document.body.insertBefore(benchmarkContainer, document.body.firstChild);

render(<App />, benchmarkContainer);
