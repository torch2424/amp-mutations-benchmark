export function setAttribute(element, attributeName, value) {
  element.setAttribute(attributeName, value);
}

export function setTextContent(element, value) {
  element.textContent = value;
}

export function reorderElement(element, nextSibling) {
  nextSibling.parentNode.insertBefore(element, nextSibling);
}

export function createTemplate(templateId) {
  const template = document.createElement("div");

  // Preact component table
  // https://preactjs.com/guide/getting-started
  let innerHTML = `
<table>
<thead>
<tr>
<th>Lifecycle method</th>
<th>When it gets called</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>componentWillMount</code></td>
<td>before the component gets mounted to the DOM</td>
</tr>
<tr>
<td><code>componentDidMount</code></td>
<td>after the component gets mounted to the DOM</td>
</tr>
<tr>
<td><code>componentWillUnmount</code></td>
<td>prior to removal from the DOM</td>
</tr>
<tr>
<td><code>componentWillReceiveProps</code></td>
<td>before new props get accepted</td>
</tr>
<tr>
<td><code>shouldComponentUpdate</code></td>
<td>before <code>render()</code>. Return <code>false</code> to skip render</td>
</tr>
<tr>
<td><code>componentWillUpdate</code></td>
<td>before <code>render()</code></td>
</tr>
<tr>
<td><code>componentDidUpdate</code></td>
<td>after <code>render()</code></td>
</tr>
</tbody>
</table>
  `;

  const randomLength = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < randomLength; i++) {
    innerHTML += innerHTML;
  }

  template.innerHTML = innerHTML;

  template.setAttribute("type", "template");

  if (templateId) {
    template.setAttribute("id", templateId);
  }

  return template;
}

export function setInnerHTML(element, template) {
  element.innerHTML = template.innerHTML;
}

export function appendChild(element, template) {
  element.appendChild(template.firstChild);
}

export function insertBefore(element, template, nextSibling) {
  element.insertBefore(template.firstChild, nextSibling);
}

export function removeElement(element) {
  element.remove();
}
