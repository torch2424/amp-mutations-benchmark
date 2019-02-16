import { h, render, Component } from "preact";
import stats from "stats-lite";

import BenchmarkRunner from "./benchmarkRunner";

import "./index.css";

console.log("AmpBenchmarkIife!");

// Run our benchamrks
const benchmarkRunner = new BenchmarkRunner();
benchmarkRunner.generateMutations(1000);
benchmarkRunner.runAllMutations();

const getTableHeadings = () => {
  const tableHeadings = [];

  Object.keys(benchmarkRunner.mutationResults).forEach(key => {
    tableHeadings.push(<th>{key}</th>);
  });

  return tableHeadings;
};

const getResultsTableRow = (name, statsCallback, stopConvertToMilliSeconds) => {
  const statsTableCells = [];

  Object.keys(benchmarkRunner.mutationResults).forEach(key => {
    const times = [];

    benchmarkRunner.mutationResults[key].forEach(result => {
      times.push(result.time);
    });

    let result = statsCallback(times);

    // Ooooo this some top quality code right here
    if (!stopConvertToMilliSeconds) {
      result = result / 1000;
    }

    // Divide by 1000 to get milliseconds
    statsTableCells.push(<td>{result}</td>);
  });

  const tableRow = (
    <tr>
      <td>{name}</td>
      {statsTableCells}
    </tr>
  );

  return tableRow;
};

const getResultTableRows = () => {
  const tableRows = [];

  tableRows.push(
    getResultsTableRow(
      "Total Ran",
      array => {
        return array.length;
      },
      true
    )
  );
  tableRows.push(getResultsTableRow("Sum", stats.sum));
  tableRows.push(getResultsTableRow("Mean (Average)", stats.mean));
  tableRows.push(getResultsTableRow("Median", stats.mean));
  tableRows.push(getResultsTableRow("Mode", stats.mode));
  tableRows.push(getResultsTableRow("Variance", stats.variance));
  tableRows.push(getResultsTableRow("Standard Deviation", stats.stdev));

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

        <table class="value-table">
          <thead>
            <tr>
              <th>Statistic</th>
              {getTableHeadings()}
            </tr>
          </thead>
          <tbody>{getResultTableRows()}</tbody>
        </table>
      </div>
    );
  }
}

// Find the first child of the body
const benchmarkContainer = document.createElement("div");
document.body.insertBefore(benchmarkContainer, document.body.firstChild);

render(<App />, benchmarkContainer);
