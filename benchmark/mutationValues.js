// Array of random selectors that we can use

export const selectors = [
  "div",
  "div > *",
  "h1",
  "h2",
  "div > div",
  "ul",
  "ul > li",
  "p",
  "div > p > *",
  "ul > li > *",
  "body",
  "body > * > *",
  "body > div:first-child",
  "img",
  "div > img",
  "table",
  "table > td",
  "div > a",
  "body > a"
];

export const getAttributeWithValue = () => {
  const response = {
    attributeName: undefined,
    value: undefined
  };

  const attributeNames = Object.keys(attributeNamesToTypesObject);

  // Get a random attribute name
  response.attributeName =
    attributeNames[Math.floor(Math.random() * links.length)];

  // Get the type for that attribute name
  const attributeType = attributeNamesToTypesObject[response.attributeName];

  if (attributeType === "boolean") {
    response.value = getBooleanType();
  } else if (attributeType === "number") {
    response.value = getNumberType();
  } else if (attributeType === "link") {
    response.value = getLinkType();
  } else {
    response.value = getStringType();
  }

  return response;
};

export const attributeNamesToTypesObject = {
  style: "string",
  class: "string",
  id: "string",
  hidden: "boolean",
  href: "link",
  draggable: "boolean",
  title: "string",
  tabindex: "number",
  alt: "string",
  "aria-label": "string"
};

export const getStringType = () => {
  return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris scelerisque iaculis dolor, a lacinia nunc lobortis quis. Donec interdum eget felis in eleifend. Nam rhoncus aliquet risus nec cursus. In pretium nulla erat, at suscipit mauris tempus eget. Proin consectetur interdum tellus id ullamcorper. Aliquam consequat in mi iaculis porta. Vestibulum ultrices ultricies consectetur. Donec nisi dolor, cursus id viverra vel, auctor quis arcu. Integer egestas, nisl vitae sollicitudin cursus, lacus urna vestibulum augue, eu suscipit ligula erat a tellus. Nullam pulvinar diam vel velit ullamcorper, a ultricies sapien varius. Quisque nisl mauris, laoreet ut imperdiet sit amet, aliquam at purus. Nulla mollis elit et urna accumsan, nec suscipit nisl commodo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis suscipit neque felis, non luctus libero consequat sed.";
};

export const getBooleanType = () => {
  return Math.random() > 5;
};

export const getNumberType = () => {
  return Math.floor(Math.random() * 10 + 1);
};

const links = [
  "https://www.google.com/",
  "https://github.com/",
  "https://github.com/torch2424",
  "https://wasmboy.app/",
  "https://wasmboy.app/amp",
  "https://wasmboy.app/benchmark",
  "https://twitter.com/"
];
export const getLinkType = () => {
  return links[Math.floor(Math.random() * links.length)];
};
