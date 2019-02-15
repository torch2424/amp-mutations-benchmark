import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import postcss from "rollup-plugin-postcss";
import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";
import copy from "rollup-plugin-copy-glob";
import pkg from "./package.json";

const babelPluginConfig = {
  exclude: ["node_modules/**"],
  plugins: [
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-proposal-object-rest-spread"],
    ["@babel/plugin-transform-react-jsx", { pragma: "h" }],
    ["@babel/plugin-proposal-export-default-from"]
  ]
};

const plugins = [
  postcss({
    extensions: [".css"]
  }),
  resolve(),
  babel(babelPluginConfig),
  commonjs(),
  json()
];

const exports = [
  {
    input: "benchmark/index.js",
    output: {
      name: "AmpBenchmark",
      file: "dist/index.iife.js",
      format: "iife"
    },
    plugins
  }
];

export default exports;
