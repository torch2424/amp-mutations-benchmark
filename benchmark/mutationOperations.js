export function setAttribute(element, attributeName, value) {
  element.setAttribute(name, value);
}

export function setTextContent(element, value) {
  element.textContent = value;
}

export function reorderElement(element, nextSibling) {
  nextSibling.parentNode.insertBefore(element, nextSibling);
}

export function createTemplate() {
  const template = document.createElement("template");
  // Preact component table
  // https://preactjs.com/guide/getting-started
  template.innerHTML = `
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

  template.setAttribute("hidden", true);

  document.body.insertBefore(template, document.body.firstChild);

  return template;
}

export function setInnerHTML(element, template) {
  element.innerHTML = template.innerHTML;
}

export function appendChild(element, template) {
  element.appendChild(template.firstChild);
}

export function insertBefore(element, template) {
  element.parentNode.insertBefore(template.firstChild, element);
}

export function removeElement(element) {
  element.remove();
}
