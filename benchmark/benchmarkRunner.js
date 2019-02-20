import microseconds from "microseconds";

import * as MutationRecords from "./mutationRecords";
import {
  getRandomSelector,
  getAttributeWithValue,
  getStringType
} from "./mutationValues";

console.log("Microsecond package check:");
const isMicrosecondTestStart = microseconds.now();
const isMicrosecondTestEnd = microseconds.now();
const isMillisecondTestStart = Date.now();
const isMillisecondTestEnd = Date.now();
const isMicrosecondTestResult = isMicrosecondTestEnd - isMicrosecondTestStart;
const isMillisecondTestResult = isMillisecondTestEnd - isMillisecondTestStart;
const isMicrosecondMin = 10;
if (isMicrosecondTestResult >= isMicrosecondMin) {
  console.log(
    `Yes! It is microseconds! Difference in time is greater than or equal to ${isMicrosecondMin}`
  );
} else {
  console.log(
    "No! It is NOT microseconds! Difference in time is less than 100. Or your computer is ridiculously fast..."
  );
}
console.log("Microsecond test result:", isMicrosecondTestResult);
console.log("Millisecond test result:", isMillisecondTestResult);

class MutationTime {
  constructor(mutationKey) {
    this.key = mutationKey;
    this.times = [];
  }

  addTime(time) {
    this.times.push(time);
  }
}

const getRandomId = () => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(2, 10);
};

const getRandomElement = parent => {
  let element;

  if (!parent) {
    parent = document;
  }

  for (let i = 0; i < 100; i++) {
    element = parent.querySelector(getRandomSelector());

    if (element) {
      i = 1000000000;
    }
  }

  if (!element) {
    return document.body.firstChild;
  }

  return element;
};

const generateMutation = () => {
  // First, find out target element
  let target = getRandomElement();

  // Next find our mutation record type
  const mutationRecordKeys = Object.keys(MutationRecords);
  const mutationRecordKey =
    mutationRecordKeys[Math.floor(Math.random() * mutationRecordKeys.length)];

  let mutation;
  if (mutationRecordKey === "ChangeAttributeMutation") {
    const attributeObject = getAttributeWithValue();

    mutation = new MutationRecords[mutationRecordKey](
      target,
      attributeObject.attributeName,
      attributeObject.value
    );
  } else if (mutationRecordKey === "ReorderMutation") {
    if (target.childElementCount <= 1) {
      target.appendChild(document.createElement("div"));
    }

    mutation = new MutationRecords[mutationRecordKey](
      target,
      target.nextSibling
    );
  } else if (mutationRecordKey === "InnerHTMLMutation") {
    mutation = new MutationRecords[mutationRecordKey](target, getRandomId());
  } else if (mutationRecordKey === "AppendChildMutation") {
    mutation = new MutationRecords[mutationRecordKey](target, getRandomId());
  } else if (mutationRecordKey === "InsertBeforeMutation") {
    if (target.childElementCount <= 1) {
      target.appendChild(document.createElement("div"));
    }

    mutation = new MutationRecords[mutationRecordKey](
      target,
      getRandomId(),
      target.querySelector("*")
    );
  } else {
    // Default will be TextContent Mutation
    mutation = new MutationRecords.TextContentMutation(target, getStringType());
  }

  return mutation;
};

export default class BenchmarkRunner {
  constructor() {
    this.mutationResults = {};
    this.mutationRecords = [];
  }

  generateMutations(numberOfMutations) {
    this.mutationRecords = [];
    this.mutationResults = {};

    if (!numberOfMutations) {
      numberOfMutations = 20;
    }
    for (let i = 0; i < numberOfMutations; i++) {
      this.mutationRecords.push(generateMutation());
    }
  }

  runMutation(mutationRecord) {
    if (this.mutationRecords.length === 0) {
      console.log("No more mutations!");
      return;
    }

    if (!mutationRecord) {
      mutationRecord = this.mutationRecords.pop();
    }

    try {
      const start = microseconds.now();
      mutationRecord.mutate();
      const time = microseconds.since(start);

      const mutationRecordName = mutationRecord.constructor.name;

      if (!this.mutationResults[mutationRecordName]) {
        this.mutationResults[mutationRecordName] = [];
      }
      this.mutationResults[mutationRecordName].push({
        mutationRecord,
        time
      });
    } catch (e) {
      console.error(e);
    }

    if (!mutationRecord) {
      console.log("Raw Results:", this.mutationResults);
    }
  }

  runAllMutations() {
    // TODO: time stramp here for klayouyt.
    this.mutationRecords.forEach(mutationRecord => {
      this.runMutation(mutationRecord);
    });
    //raf, inside raf setimteout 0, then timestamp end.

    // then promise resolve.

    this.mutationRecords = [];

    console.log("Raw Results:", this.mutationResults);
  }

  getTotalMutationsRun() {
    let totalMutationsRun = 0;

    Object.keys(this.mutationResults).forEach(key => {
      totalMutationsRun += this.mutationResults[key].length;
    });

    return totalMutationsRun;
  }
}
