import { h, render, Component } from "preact";

import "./index.css";

console.log("AmpBenchmarkIife!");

// Run our benchamrks

// Render the results
class App extends Component {
  render() {
    return (
      <div class="amp-benchmark">
        <h1>AMP Benchmark</h1>
      </div>
    );
  }
}

// Find the first child of the body
const benchmarkContainer = document.createElement("div");
document.body.insertBefore(benchmarkContainer, document.body.firstChild);

render(<App />, benchmarkContainer);
