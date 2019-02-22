import microseconds from "microseconds";

import * as MutationRecords from "./mutationRecords";
import {
  getRandomSelector,
  getAttributeWithValue,
  getStringType
} from "./mutationValues";

// Import dom purify from AMP
import { purifyHtml } from "./purifier";
import DOMPurify from "dompurify";

console.log("Microsecond package check:");
const isMicrosecondTestStart = microseconds.now();
const isMicrosecondTestEnd = microseconds.now();
const isMillisecondTestStart = Date.now();
const isMillisecondTestEnd = Date.now();
const isMicrosecondTestResult = isMicrosecondTestEnd - isMicrosecondTestStart;
const isMillisecondTestResult = isMillisecondTestEnd - isMillisecondTestStart;
const isMicrosecondMin = 5;
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

    if (!numberOfMutations) {
      numberOfMutations = 20;
    }
    for (let i = 0; i < numberOfMutations; i++) {
      this.mutationRecords.push(generateMutation());
    }
  }

  runMutation(mutationRecord, shouldPurify) {
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
      if (shouldPurify) {
        let dirtyTarget = mutationRecord.target;
        if (dirtyTarget.parentElement) {
          dirtyTarget = dirtyTarget.parentElement;
        }

        // AMP DOMPurify
        const purifiedBodyNode = purifyHtml(dirtyTarget.innerHTML);

        // Let's simlate the innerHTML by just creating a new element and inserting there
        const purifiedElement = document.createElement("div");
        purifiedElement.innerHTML = purifiedBodyNode.innerHTML;

        /* DOMPurify
        const clean = DOMPurify.sanitize(dirtyTarget.innerHTML);
        const purifiedElement = document.createElement("div");
        purifiedElement.innerHTML = clean;
        */
      }
      const time = microseconds.since(start);

      const mutationRecordName = mutationRecord.constructor.name;

      let mutationResultCategory;
      if (shouldPurify) {
        mutationResultCategory = "sanitized";
      } else {
        mutationResultCategory = "notSanitized";
      }

      if (!this.mutationResults[mutationResultCategory]) {
        this.mutationResults[mutationResultCategory] = {};
      }

      if (!this.mutationResults[mutationResultCategory][mutationRecordName]) {
        this.mutationResults[mutationResultCategory][mutationRecordName] = [];
      }

      this.mutationResults[mutationResultCategory][mutationRecordName].push({
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

  runAllMutations(shouldPurify) {
    // TODO: time stramp here for klayouyt.
    this.mutationRecords.forEach(mutationRecord => {
      this.runMutation(mutationRecord, shouldPurify);
    });
    //raf, inside raf setimteout 0, then timestamp end.

    // then promise resolve.

    this.mutationRecords = [];

    console.log("Raw Results:", this.mutationResults);
  }

  getTotalMutationsRun() {
    let totalMutationsRun = 0;

    Object.keys(this.mutationResults).forEach(categoryKey => {
      Object.keys(this.mutationResults[categoryKey]).forEach(key => {
        totalMutationsRun += this.mutationResults[categoryKey][key].length;
      });
    });

    return totalMutationsRun;
  }
}
