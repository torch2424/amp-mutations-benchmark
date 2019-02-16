import {
  setAttribute,
  setTextContent,
  reorderElement,
  createTemplate,
  setInnerHTML,
  appendChild,
  insertBefore,
  removeElement
} from "./mutationOperations";

const getChildMockElement = parent => {
  const mockElement = document.createElement("div");
  mockElement.setAttribute("type", "mock");
  parent.appendChild(mockElement);
  return mockElement;
};

class MutationRecord {
  constructor(mutationRecordObject) {
    if (!mutationRecordObject) {
      throw new Error("Missing mutationRecordObject!");
    }

    if (!mutationRecordObject.type) {
      throw new Error("Mutation Record Missing Type!");
    }

    if (!mutationRecordObject.target) {
      throw new Error("Mutation Record missing selector!");
    }

    Object.keys(mutationRecordObject).forEach(key => {
      this[key] = mutationRecordObject[key];
    });

    this.mutated = false;
  }

  mutate() {
    throw new Error("You must override mutate()!");
  }
}

export class ChangeAttributeMutation extends MutationRecord {
  constructor(target, attributeName, value) {
    super({
      type: "attributes",
      target,
      attributeName,
      value
    });
  }

  mutate() {
    setAttribute(this.target, this.attributeName, this.value);
    this.mutated = true;
  }
}

export class TextContentMutation extends MutationRecord {
  constructor(target, value) {
    // This is a destructive operation.
    // Create child element, and set the text content of that
    target = getChildMockElement(target);

    super({
      type: "characterData",
      target,
      value
    });
  }

  mutate() {
    setTextContent(this.target, this.value);
    this.mutated = true;
  }
}

export class ReorderMutation extends MutationRecord {
  constructor(target, nextSibling) {
    super({
      type: "childList",
      target,
      nextSibling
    });
  }

  mutate() {
    reorderElement(this.target, this.nextSibling);
    this.mutated = true;
  }
}

export class InnerHTMLMutation extends MutationRecord {
  constructor(target, templateId) {
    // This is a destructive operation.
    // Create child element, and set the text content of that
    target = getChildMockElement(target);

    super({
      type: "childList",
      target,
      value: createTemplate(templateId)
    });
  }

  mutate() {
    setInnerHTML(this.target, this.value);
    this.mutated = true;
  }
}

export class AppendChildMutation extends MutationRecord {
  constructor(target, templateId) {
    super({
      type: "childList",
      target,
      addedNodes: createTemplate(templateId)
    });
  }

  mutate() {
    appendChild(this.target, this.addedNodes);
    this.mutated = true;
  }
}

export class InsertBeforeMutation extends MutationRecord {
  constructor(target, templateId, nextSibling) {
    super({
      type: "childList",
      target,
      addedNodes: createTemplate(templateId),
      nextSibling
    });
  }

  mutate() {
    insertBefore(this.target, this.addedNodes, this.nextSibling);
    this.mutated = true;
  }
}

// Maybe test this at some point
class RemoveMutation extends MutationRecord {
  constructor(target) {
    super({
      type: "childList",
      target,
      removedNodes: target.firstChild
    });
  }

  mutate() {
    remove(this.removedNodes);
    this.mutated = true;
  }
}
