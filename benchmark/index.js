import { h, render, Component } from "preact";
import stats from "stats-lite";
import microseconds from "microseconds";
import browserDetect from "browser-detect";

import BenchmarkRunner from "./benchmarkRunner";

import "./index.css";

const benchmarkRunner = new BenchmarkRunner();
const numberOfMutationsPerPass = 200;

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

// Function to wait for layout
// Thank you sepand!
const waitForLayout = () => {
  let start = microseconds.now();
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const time = microseconds.since(start);
        resolve(time);
      }, 0);
    });
  });
};

const timesToLayout = [];

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
        <div>Times to layout: {timesToLayout}</div>
        <div>Mutations Per Pass: {numberOfMutationsPerPass}</div>

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

const runBenchmarkTask = async () => {
  const numberOfMutationsPerPass = 200;

  // Run our benchamrks
  benchmarkRunner.generateMutations(numberOfMutationsPerPass);
  benchmarkRunner.runAllMutations();

  // Wait for layout
  let layoutTime = await waitForLayout();
  layoutTime = layoutTime / 1000;
  timesToLayout.push(`${layoutTime}, `);

  benchmarkRunner.generateMutations(numberOfMutationsPerPass);
  benchmarkRunner.runAllMutations(true);

  // Wait for layout
  layoutTime = await waitForLayout();
  layoutTime = layoutTime / 1000;
  timesToLayout.push(`${layoutTime}`);

  // Find the first child of the body
  const benchmarkContainer = document.createElement("div");
  benchmarkContainer.id = "benchmark-container";

  await waitForLayout();
  document.body.insertBefore(benchmarkContainer, document.body.firstChild);
  render(<App />, benchmarkContainer);

  // Ping our server with all the info of this run.
  let benchmarkResultInfo = {
    comment: "// All times in Milliseconds",
    browser: {
      ...browserDetect(),
      userAgent: window.navigator.userAgent
    },
    layoutTime: {
      milliseconds: {
        sanitized: timesToLayout[1],
        notSanitized: timesToLayout[0]
      }
    },
    mutationResults: {
      totalRan: benchmarkRunner.getTotalMutationsRun(),
      mutationsPerPass: numberOfMutationsPerPass
    }
  };

  // Add our stats to the resultInfo
  const addResultsToResultInfo = resultCategoryKey => {
    benchmarkResultInfo.mutationResults[resultCategoryKey] = {};

    Object.keys(benchmarkRunner.mutationResults[resultCategoryKey]).forEach(
      key => {
        const times = [];

        benchmarkRunner.mutationResults[resultCategoryKey][key].forEach(
          result => {
            times.push(result.time / 1000);
          }
        );

        benchmarkResultInfo.mutationResults[resultCategoryKey][key] = {};

        benchmarkResultInfo.mutationResults[resultCategoryKey][
          key
        ].times = times;

        const statsCallbacks = [
          "sum",
          "mean",
          "median",
          "mode",
          "variance",
          "stdev"
        ];
        statsCallbacks.forEach(callbackKey => {
          // Add all of our stats
          benchmarkResultInfo.mutationResults[resultCategoryKey][key][
            callbackKey
          ] = stats[callbackKey](times);
        });

        // Add the min / max
        benchmarkResultInfo.mutationResults[resultCategoryKey][
          key
        ].max = Math.max.apply(Math, times);
        benchmarkResultInfo.mutationResults[resultCategoryKey][
          key
        ].min = Math.min.apply(Math, times);
      }
    );
  };

  // Add our results
  addResultsToResultInfo("notSanitized");
  addResultsToResultInfo("sanitized");

  // Get the page we ran this on
  const urlParams = new URLSearchParams(window.location.search);
  const url = new URL(urlParams.get("page"));
  benchmarkResultInfo.url = {
    host: url.host,
    hostname: url.hostname,
    origin: url.origin,
    href: url.href,
    pathname: url.pathname,
    protocol: url.protocol
  };

  console.log("Sending Result Info to server:", benchmarkResultInfo);

  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Uploading_JSON_data
  await fetch("/benchmark/results", {
    method: "POST",
    body: JSON.stringify(benchmarkResultInfo),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(response => console.log("POST Success:", JSON.stringify(response)))
    .catch(error => console.error("POST Error:", error));
};
runBenchmarkTask();
