(function() {
  "use strict";

  var VNode = function VNode() {};

  var options = {};

  var stack = [];

  var EMPTY_CHILDREN = [];

  function h(nodeName, attributes) {
    var children = EMPTY_CHILDREN,
      lastSimple,
      child,
      simple,
      i;
    for (i = arguments.length; i-- > 2; ) {
      stack.push(arguments[i]);
    }
    if (attributes && attributes.children != null) {
      if (!stack.length) stack.push(attributes.children);
      delete attributes.children;
    }
    while (stack.length) {
      if ((child = stack.pop()) && child.pop !== undefined) {
        for (i = child.length; i--; ) {
          stack.push(child[i]);
        }
      } else {
        if (typeof child === "boolean") child = null;

        if ((simple = typeof nodeName !== "function")) {
          if (child == null) child = "";
          else if (typeof child === "number") child = String(child);
          else if (typeof child !== "string") simple = false;
        }

        if (simple && lastSimple) {
          children[children.length - 1] += child;
        } else if (children === EMPTY_CHILDREN) {
          children = [child];
        } else {
          children.push(child);
        }

        lastSimple = simple;
      }
    }

    var p = new VNode();
    p.nodeName = nodeName;
    p.children = children;
    p.attributes = attributes == null ? undefined : attributes;
    p.key = attributes == null ? undefined : attributes.key;

    return p;
  }

  function extend(obj, props) {
    for (var i in props) {
      obj[i] = props[i];
    }
    return obj;
  }

  function applyRef(ref, value) {
    if (ref != null) {
      if (typeof ref == "function") ref(value);
      else ref.current = value;
    }
  }

  var defer =
    typeof Promise == "function"
      ? Promise.resolve().then.bind(Promise.resolve())
      : setTimeout;

  var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

  var items = [];

  function enqueueRender(component) {
    if (
      !component._dirty &&
      (component._dirty = true) &&
      items.push(component) == 1
    ) {
      defer(rerender);
    }
  }

  function rerender() {
    var p;
    while ((p = items.pop())) {
      if (p._dirty) renderComponent(p);
    }
  }

  function isSameNodeType(node, vnode, hydrating) {
    if (typeof vnode === "string" || typeof vnode === "number") {
      return node.splitText !== undefined;
    }
    if (typeof vnode.nodeName === "string") {
      return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
    }
    return hydrating || node._componentConstructor === vnode.nodeName;
  }

  function isNamedNode(node, nodeName) {
    return (
      node.normalizedNodeName === nodeName ||
      node.nodeName.toLowerCase() === nodeName.toLowerCase()
    );
  }

  function getNodeProps(vnode) {
    var props = extend({}, vnode.attributes);
    props.children = vnode.children;

    var defaultProps = vnode.nodeName.defaultProps;
    if (defaultProps !== undefined) {
      for (var i in defaultProps) {
        if (props[i] === undefined) {
          props[i] = defaultProps[i];
        }
      }
    }

    return props;
  }

  function createNode(nodeName, isSvg) {
    var node = isSvg
      ? document.createElementNS("http://www.w3.org/2000/svg", nodeName)
      : document.createElement(nodeName);
    node.normalizedNodeName = nodeName;
    return node;
  }

  function removeNode(node) {
    var parentNode = node.parentNode;
    if (parentNode) parentNode.removeChild(node);
  }

  function setAccessor(node, name, old, value, isSvg) {
    if (name === "className") name = "class";

    if (name === "key");
    else if (name === "ref") {
      applyRef(old, null);
      applyRef(value, node);
    } else if (name === "class" && !isSvg) {
      node.className = value || "";
    } else if (name === "style") {
      if (!value || typeof value === "string" || typeof old === "string") {
        node.style.cssText = value || "";
      }
      if (value && typeof value === "object") {
        if (typeof old !== "string") {
          for (var i in old) {
            if (!(i in value)) node.style[i] = "";
          }
        }
        for (var i in value) {
          node.style[i] =
            typeof value[i] === "number" && IS_NON_DIMENSIONAL.test(i) === false
              ? value[i] + "px"
              : value[i];
        }
      }
    } else if (name === "dangerouslySetInnerHTML") {
      if (value) node.innerHTML = value.__html || "";
    } else if (name[0] == "o" && name[1] == "n") {
      var useCapture = name !== (name = name.replace(/Capture$/, ""));
      name = name.toLowerCase().substring(2);
      if (value) {
        if (!old) node.addEventListener(name, eventProxy, useCapture);
      } else {
        node.removeEventListener(name, eventProxy, useCapture);
      }
      (node._listeners || (node._listeners = {}))[name] = value;
    } else if (name !== "list" && name !== "type" && !isSvg && name in node) {
      try {
        node[name] = value == null ? "" : value;
      } catch (e) {}
      if ((value == null || value === false) && name != "spellcheck")
        node.removeAttribute(name);
    } else {
      var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ""));

      if (value == null || value === false) {
        if (ns)
          node.removeAttributeNS(
            "http://www.w3.org/1999/xlink",
            name.toLowerCase()
          );
        else node.removeAttribute(name);
      } else if (typeof value !== "function") {
        if (ns)
          node.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            name.toLowerCase(),
            value
          );
        else node.setAttribute(name, value);
      }
    }
  }

  function eventProxy(e) {
    return this._listeners[e.type](e);
  }

  var mounts = [];

  var diffLevel = 0;

  var isSvgMode = false;

  var hydrating = false;

  function flushMounts() {
    var c;
    while ((c = mounts.shift())) {
      if (c.componentDidMount) c.componentDidMount();
    }
  }

  function diff(dom, vnode, context, mountAll, parent, componentRoot) {
    if (!diffLevel++) {
      isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

      hydrating = dom != null && !("__preactattr_" in dom);
    }

    var ret = idiff(dom, vnode, context, mountAll, componentRoot);

    if (parent && ret.parentNode !== parent) parent.appendChild(ret);

    if (!--diffLevel) {
      hydrating = false;

      if (!componentRoot) flushMounts();
    }

    return ret;
  }

  function idiff(dom, vnode, context, mountAll, componentRoot) {
    var out = dom,
      prevSvgMode = isSvgMode;

    if (vnode == null || typeof vnode === "boolean") vnode = "";

    if (typeof vnode === "string" || typeof vnode === "number") {
      if (
        dom &&
        dom.splitText !== undefined &&
        dom.parentNode &&
        (!dom._component || componentRoot)
      ) {
        if (dom.nodeValue != vnode) {
          dom.nodeValue = vnode;
        }
      } else {
        out = document.createTextNode(vnode);
        if (dom) {
          if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
          recollectNodeTree(dom, true);
        }
      }

      out["__preactattr_"] = true;

      return out;
    }

    var vnodeName = vnode.nodeName;
    if (typeof vnodeName === "function") {
      return buildComponentFromVNode(dom, vnode, context, mountAll);
    }

    isSvgMode =
      vnodeName === "svg"
        ? true
        : vnodeName === "foreignObject"
        ? false
        : isSvgMode;

    vnodeName = String(vnodeName);
    if (!dom || !isNamedNode(dom, vnodeName)) {
      out = createNode(vnodeName, isSvgMode);

      if (dom) {
        while (dom.firstChild) {
          out.appendChild(dom.firstChild);
        }
        if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

        recollectNodeTree(dom, true);
      }
    }

    var fc = out.firstChild,
      props = out["__preactattr_"],
      vchildren = vnode.children;

    if (props == null) {
      props = out["__preactattr_"] = {};
      for (var a = out.attributes, i = a.length; i--; ) {
        props[a[i].name] = a[i].value;
      }
    }

    if (
      !hydrating &&
      vchildren &&
      vchildren.length === 1 &&
      typeof vchildren[0] === "string" &&
      fc != null &&
      fc.splitText !== undefined &&
      fc.nextSibling == null
    ) {
      if (fc.nodeValue != vchildren[0]) {
        fc.nodeValue = vchildren[0];
      }
    } else if ((vchildren && vchildren.length) || fc != null) {
      innerDiffNode(
        out,
        vchildren,
        context,
        mountAll,
        hydrating || props.dangerouslySetInnerHTML != null
      );
    }

    diffAttributes(out, vnode.attributes, props);

    isSvgMode = prevSvgMode;

    return out;
  }

  function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
    var originalChildren = dom.childNodes,
      children = [],
      keyed = {},
      keyedLen = 0,
      min = 0,
      len = originalChildren.length,
      childrenLen = 0,
      vlen = vchildren ? vchildren.length : 0,
      j,
      c,
      f,
      vchild,
      child;

    if (len !== 0) {
      for (var i = 0; i < len; i++) {
        var _child = originalChildren[i],
          props = _child["__preactattr_"],
          key =
            vlen && props
              ? _child._component
                ? _child._component.__key
                : props.key
              : null;
        if (key != null) {
          keyedLen++;
          keyed[key] = _child;
        } else if (
          props ||
          (_child.splitText !== undefined
            ? isHydrating
              ? _child.nodeValue.trim()
              : true
            : isHydrating)
        ) {
          children[childrenLen++] = _child;
        }
      }
    }

    if (vlen !== 0) {
      for (var i = 0; i < vlen; i++) {
        vchild = vchildren[i];
        child = null;

        var key = vchild.key;
        if (key != null) {
          if (keyedLen && keyed[key] !== undefined) {
            child = keyed[key];
            keyed[key] = undefined;
            keyedLen--;
          }
        } else if (min < childrenLen) {
          for (j = min; j < childrenLen; j++) {
            if (
              children[j] !== undefined &&
              isSameNodeType((c = children[j]), vchild, isHydrating)
            ) {
              child = c;
              children[j] = undefined;
              if (j === childrenLen - 1) childrenLen--;
              if (j === min) min++;
              break;
            }
          }
        }

        child = idiff(child, vchild, context, mountAll);

        f = originalChildren[i];
        if (child && child !== dom && child !== f) {
          if (f == null) {
            dom.appendChild(child);
          } else if (child === f.nextSibling) {
            removeNode(f);
          } else {
            dom.insertBefore(child, f);
          }
        }
      }
    }

    if (keyedLen) {
      for (var i in keyed) {
        if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
      }
    }

    while (min <= childrenLen) {
      if ((child = children[childrenLen--]) !== undefined)
        recollectNodeTree(child, false);
    }
  }

  function recollectNodeTree(node, unmountOnly) {
    var component = node._component;
    if (component) {
      unmountComponent(component);
    } else {
      if (node["__preactattr_"] != null)
        applyRef(node["__preactattr_"].ref, null);

      if (unmountOnly === false || node["__preactattr_"] == null) {
        removeNode(node);
      }

      removeChildren(node);
    }
  }

  function removeChildren(node) {
    node = node.lastChild;
    while (node) {
      var next = node.previousSibling;
      recollectNodeTree(node, true);
      node = next;
    }
  }

  function diffAttributes(dom, attrs, old) {
    var name;

    for (name in old) {
      if (!(attrs && attrs[name] != null) && old[name] != null) {
        setAccessor(dom, name, old[name], (old[name] = undefined), isSvgMode);
      }
    }

    for (name in attrs) {
      if (
        name !== "children" &&
        name !== "innerHTML" &&
        (!(name in old) ||
          attrs[name] !==
            (name === "value" || name === "checked" ? dom[name] : old[name]))
      ) {
        setAccessor(dom, name, old[name], (old[name] = attrs[name]), isSvgMode);
      }
    }
  }

  var recyclerComponents = [];

  function createComponent(Ctor, props, context) {
    var inst,
      i = recyclerComponents.length;

    if (Ctor.prototype && Ctor.prototype.render) {
      inst = new Ctor(props, context);
      Component.call(inst, props, context);
    } else {
      inst = new Component(props, context);
      inst.constructor = Ctor;
      inst.render = doRender;
    }

    while (i--) {
      if (recyclerComponents[i].constructor === Ctor) {
        inst.nextBase = recyclerComponents[i].nextBase;
        recyclerComponents.splice(i, 1);
        return inst;
      }
    }

    return inst;
  }

  function doRender(props, state, context) {
    return this.constructor(props, context);
  }

  function setComponentProps(component, props, renderMode, context, mountAll) {
    if (component._disable) return;
    component._disable = true;

    component.__ref = props.ref;
    component.__key = props.key;
    delete props.ref;
    delete props.key;

    if (typeof component.constructor.getDerivedStateFromProps === "undefined") {
      if (!component.base || mountAll) {
        if (component.componentWillMount) component.componentWillMount();
      } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(props, context);
      }
    }

    if (context && context !== component.context) {
      if (!component.prevContext) component.prevContext = component.context;
      component.context = context;
    }

    if (!component.prevProps) component.prevProps = component.props;
    component.props = props;

    component._disable = false;

    if (renderMode !== 0) {
      if (
        renderMode === 1 ||
        options.syncComponentUpdates !== false ||
        !component.base
      ) {
        renderComponent(component, 1, mountAll);
      } else {
        enqueueRender(component);
      }
    }

    applyRef(component.__ref, component);
  }

  function renderComponent(component, renderMode, mountAll, isChild) {
    if (component._disable) return;

    var props = component.props,
      state = component.state,
      context = component.context,
      previousProps = component.prevProps || props,
      previousState = component.prevState || state,
      previousContext = component.prevContext || context,
      isUpdate = component.base,
      nextBase = component.nextBase,
      initialBase = isUpdate || nextBase,
      initialChildComponent = component._component,
      skip = false,
      snapshot = previousContext,
      rendered,
      inst,
      cbase;

    if (component.constructor.getDerivedStateFromProps) {
      state = extend(
        extend({}, state),
        component.constructor.getDerivedStateFromProps(props, state)
      );
      component.state = state;
    }

    if (isUpdate) {
      component.props = previousProps;
      component.state = previousState;
      component.context = previousContext;
      if (
        renderMode !== 2 &&
        component.shouldComponentUpdate &&
        component.shouldComponentUpdate(props, state, context) === false
      ) {
        skip = true;
      } else if (component.componentWillUpdate) {
        component.componentWillUpdate(props, state, context);
      }
      component.props = props;
      component.state = state;
      component.context = context;
    }

    component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    component._dirty = false;

    if (!skip) {
      rendered = component.render(props, state, context);

      if (component.getChildContext) {
        context = extend(extend({}, context), component.getChildContext());
      }

      if (isUpdate && component.getSnapshotBeforeUpdate) {
        snapshot = component.getSnapshotBeforeUpdate(
          previousProps,
          previousState
        );
      }

      var childComponent = rendered && rendered.nodeName,
        toUnmount,
        base;

      if (typeof childComponent === "function") {
        var childProps = getNodeProps(rendered);
        inst = initialChildComponent;

        if (
          inst &&
          inst.constructor === childComponent &&
          childProps.key == inst.__key
        ) {
          setComponentProps(inst, childProps, 1, context, false);
        } else {
          toUnmount = inst;

          component._component = inst = createComponent(
            childComponent,
            childProps,
            context
          );
          inst.nextBase = inst.nextBase || nextBase;
          inst._parentComponent = component;
          setComponentProps(inst, childProps, 0, context, false);
          renderComponent(inst, 1, mountAll, true);
        }

        base = inst.base;
      } else {
        cbase = initialBase;

        toUnmount = initialChildComponent;
        if (toUnmount) {
          cbase = component._component = null;
        }

        if (initialBase || renderMode === 1) {
          if (cbase) cbase._component = null;
          base = diff(
            cbase,
            rendered,
            context,
            mountAll || !isUpdate,
            initialBase && initialBase.parentNode,
            true
          );
        }
      }

      if (
        initialBase &&
        base !== initialBase &&
        inst !== initialChildComponent
      ) {
        var baseParent = initialBase.parentNode;
        if (baseParent && base !== baseParent) {
          baseParent.replaceChild(base, initialBase);

          if (!toUnmount) {
            initialBase._component = null;
            recollectNodeTree(initialBase, false);
          }
        }
      }

      if (toUnmount) {
        unmountComponent(toUnmount);
      }

      component.base = base;
      if (base && !isChild) {
        var componentRef = component,
          t = component;
        while ((t = t._parentComponent)) {
          (componentRef = t).base = base;
        }
        base._component = componentRef;
        base._componentConstructor = componentRef.constructor;
      }
    }

    if (!isUpdate || mountAll) {
      mounts.push(component);
    } else if (!skip) {
      if (component.componentDidUpdate) {
        component.componentDidUpdate(previousProps, previousState, snapshot);
      }
    }

    while (component._renderCallbacks.length) {
      component._renderCallbacks.pop().call(component);
    }
    if (!diffLevel && !isChild) flushMounts();
  }

  function buildComponentFromVNode(dom, vnode, context, mountAll) {
    var c = dom && dom._component,
      originalComponent = c,
      oldDom = dom,
      isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
      isOwner = isDirectOwner,
      props = getNodeProps(vnode);
    while (c && !isOwner && (c = c._parentComponent)) {
      isOwner = c.constructor === vnode.nodeName;
    }

    if (c && isOwner && (!mountAll || c._component)) {
      setComponentProps(c, props, 3, context, mountAll);
      dom = c.base;
    } else {
      if (originalComponent && !isDirectOwner) {
        unmountComponent(originalComponent);
        dom = oldDom = null;
      }

      c = createComponent(vnode.nodeName, props, context);
      if (dom && !c.nextBase) {
        c.nextBase = dom;

        oldDom = null;
      }
      setComponentProps(c, props, 1, context, mountAll);
      dom = c.base;

      if (oldDom && dom !== oldDom) {
        oldDom._component = null;
        recollectNodeTree(oldDom, false);
      }
    }

    return dom;
  }

  function unmountComponent(component) {
    var base = component.base;

    component._disable = true;

    if (component.componentWillUnmount) component.componentWillUnmount();

    component.base = null;

    var inner = component._component;
    if (inner) {
      unmountComponent(inner);
    } else if (base) {
      if (base["__preactattr_"] != null)
        applyRef(base["__preactattr_"].ref, null);

      component.nextBase = base;

      removeNode(base);
      recyclerComponents.push(component);

      removeChildren(base);
    }

    applyRef(component.__ref, null);
  }

  function Component(props, context) {
    this._dirty = true;

    this.context = context;

    this.props = props;

    this.state = this.state || {};

    this._renderCallbacks = [];
  }

  extend(Component.prototype, {
    setState: function setState(state, callback) {
      if (!this.prevState) this.prevState = this.state;
      this.state = extend(
        extend({}, this.state),
        typeof state === "function" ? state(this.state, this.props) : state
      );
      if (callback) this._renderCallbacks.push(callback);
      enqueueRender(this);
    },
    forceUpdate: function forceUpdate(callback) {
      if (callback) this._renderCallbacks.push(callback);
      renderComponent(this, 2);
    },
    render: function render() {}
  });

  function render(vnode, parent, merge) {
    return diff(merge, vnode, {}, false, parent, false);
  }
  //# sourceMappingURL=preact.mjs.map

  var isnumber = isNumber;

  /**
   * Determine if something is a non-infinite javascript number.
   * @param  {Number}  n A (potential) number to see if it is a number.
   * @return {Boolean}   True for non-infinite numbers, false for all else.
   */
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  var numbers_1 = numbers;
  var sum_1 = sum;
  var mean_1 = mean;
  var median_1 = median;
  var mode_1 = mode;
  var variance = populationVariance;
  var sampleVariance_1 = sampleVariance;
  var populationVariance_1 = populationVariance;
  var stdev = populationStdev;
  var sampleStdev_1 = sampleStdev;
  var populationStdev_1 = populationStdev;
  var percentile_1 = percentile;
  var histogram_1 = histogram;

  function numbers(vals) {
    var nums = [];
    if (vals == null) return nums;

    for (var i = 0; i < vals.length; i++) {
      if (isnumber(vals[i])) nums.push(+vals[i]);
    }
    return nums;
  }

  function nsort(vals) {
    return vals.sort(function numericSort(a, b) {
      return a - b;
    });
  }

  function sum(vals) {
    vals = numbers(vals);
    var total = 0;
    for (var i = 0; i < vals.length; i++) {
      total += vals[i];
    }
    return total;
  }

  function mean(vals) {
    vals = numbers(vals);
    if (vals.length === 0) return NaN;
    return sum(vals) / vals.length;
  }

  function median(vals) {
    vals = numbers(vals);
    if (vals.length === 0) return NaN;

    var half = (vals.length / 2) | 0;

    vals = nsort(vals);
    if (vals.length % 2) {
      // Odd length, true middle element
      return vals[half];
    } else {
      // Even length, average middle two elements
      return (vals[half - 1] + vals[half]) / 2.0;
    }
  }

  // Returns the mode of a unimodal dataset
  // If the dataset is multi-modal, returns a Set containing the modes
  function mode(vals) {
    vals = numbers(vals);
    if (vals.length === 0) return NaN;
    var mode = NaN;
    var dist = {};

    for (var i = 0; i < vals.length; i++) {
      var value = vals[i];
      var me = dist[value] || 0;
      me++;
      dist[value] = me;
    }

    var rank = numbers(
      Object.keys(dist).sort(function sortMembers(a, b) {
        return dist[b] - dist[a];
      })
    );
    mode = rank[0];
    if (dist[rank[1]] == dist[mode]) {
      // multi-modal
      if (rank.length == vals.length) {
        // all values are modes
        return vals;
      }
      var modes = new Set([mode]);
      var modeCount = dist[mode];
      for (var i = 1; i < rank.length; i++) {
        if (dist[rank[i]] == modeCount) {
          modes.add(rank[i]);
        } else {
          break;
        }
      }
      return modes;
    }
    return mode;
  }

  // This helper finds the mean of all the values, then squares the difference
  // from the mean for each value and returns the resulting array.  This is the
  // core of the varience functions - the difference being dividing by N or N-1.
  function valuesMinusMeanSquared(vals) {
    vals = numbers(vals);
    var avg = mean(vals);
    var diffs = [];
    for (var i = 0; i < vals.length; i++) {
      diffs.push(Math.pow(vals[i] - avg, 2));
    }
    return diffs;
  }

  // Population Variance = average squared deviation from mean
  function populationVariance(vals) {
    return mean(valuesMinusMeanSquared(vals));
  }

  // Sample Variance
  function sampleVariance(vals) {
    var diffs = valuesMinusMeanSquared(vals);
    if (diffs.length <= 1) return NaN;

    return sum(diffs) / (diffs.length - 1);
  }

  // Population Standard Deviation = sqrt of population variance
  function populationStdev(vals) {
    return Math.sqrt(populationVariance(vals));
  }

  // Sample Standard Deviation = sqrt of sample variance
  function sampleStdev(vals) {
    return Math.sqrt(sampleVariance(vals));
  }

  function percentile(vals, ptile) {
    vals = numbers(vals);
    if (vals.length === 0 || ptile == null || ptile < 0) return NaN;

    // Fudge anything over 100 to 1.0
    if (ptile > 1) ptile = 1;
    vals = nsort(vals);
    var i = vals.length * ptile - 0.5;
    if ((i | 0) === i) return vals[i];
    // interpolated percentile -- using Estimation method
    var int_part = i | 0;
    var fract = i - int_part;
    return (
      (1 - fract) * vals[int_part] +
      fract * vals[Math.min(int_part + 1, vals.length - 1)]
    );
  }

  function histogram(vals, bins) {
    if (vals == null) {
      return null;
    }
    vals = nsort(numbers(vals));
    if (vals.length === 0) {
      return null;
    }
    if (bins == null) {
      // pick bins by simple method: Math.sqrt(n)
      bins = Math.sqrt(vals.length);
    }
    bins = Math.round(bins);
    if (bins < 1) {
      bins = 1;
    }

    var min = vals[0];
    var max = vals[vals.length - 1];
    if (min === max) {
      // fudge for non-variant data
      min = min - 0.5;
      max = max + 0.5;
    }

    var range = max - min;
    // make the bins slightly larger by expanding the range about 10%
    // this helps with dumb floating point stuff
    var binWidth = (range + range * 0.05) / bins;
    var midpoint = (min + max) / 2;
    // even bin count, midpoint makes an edge
    var leftEdge = midpoint - binWidth * Math.floor(bins / 2);
    if (bins % 2 !== 0) {
      // odd bin count, center middle bin on midpoint
      var leftEdge = midpoint - binWidth / 2 - binWidth * Math.floor(bins / 2);
    }

    var hist = {
      values: Array(bins).fill(0),
      bins: bins,
      binWidth: binWidth,
      binLimits: [leftEdge, leftEdge + binWidth * bins]
    };

    var binIndex = 0;
    for (var i = 0; i < vals.length; i++) {
      while (vals[i] > (binIndex + 1) * binWidth + leftEdge) {
        binIndex++;
      }
      hist.values[binIndex]++;
    }

    return hist;
  }

  var stats = {
    numbers: numbers_1,
    sum: sum_1,
    mean: mean_1,
    median: median_1,
    mode: mode_1,
    variance: variance,
    sampleVariance: sampleVariance_1,
    populationVariance: populationVariance_1,
    stdev: stdev,
    sampleStdev: sampleStdev_1,
    populationStdev: populationStdev_1,
    percentile: percentile_1,
    histogram: histogram_1
  };

  var commonjsGlobal =
    typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : typeof self !== "undefined"
      ? self
      : {};

  var now;

  if (commonjsGlobal.process && process.hrtime) {
    var hrtime = process.hrtime;

    now = function() {
      var hr = hrtime();
      return (hr[0] * 1e9 + hr[1]) / 1e3;
    };
  } else if (commonjsGlobal.performance && performance.now) {
    var start =
      (performance.timing && performance.timing.navigationStart) || Date.now();

    now = function() {
      return (start + performance.now()) * 1e3;
    };
  } else {
    now = function() {
      return Date.now() * 1e3;
    };
  }

  var now_1 = now;

  var toString = function() {
    var microseconds = this.microseconds,
      milliseconds = this.milliseconds,
      seconds = this.seconds,
      minutes = this.minutes,
      hours = this.hours,
      days = this.days;

    var parts = [
      {
        name: "day",
        value: days
      },
      {
        name: "hour",
        value: hours
      },
      {
        name: "minute",
        value: minutes
      },
      {
        name: "second",
        value: seconds
      },
      {
        name: "millisecond",
        value: milliseconds
      },
      {
        name: "microsecond",
        value: microseconds
      }
    ];

    var time = [];

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (part.value === 0) {
        if (!time.length) continue; // nothing was added yet

        var broken = false;

        for (var j = i; j < parts.length; j++) {
          var p = parts[j];
          if (p.value) {
            broken = true;
            break;
          }
        }

        if (!broken) break;
      }

      time.push(part.value, part.value === 1 ? part.name : part.name + "s");
    }

    return time.join(" ");
  };

  var parse = function parse(nano) {
    var ms = nano / 1000;
    var ss = ms / 1000;
    var mm = ss / 60;
    var hh = mm / 60;
    var dd = hh / 24;

    var microseconds = Math.round((ms % 1) * 1000);
    var milliseconds = Math.floor(ms % 1000);
    var seconds = Math.floor(ss % 60);
    var minutes = Math.floor(mm % 60);
    var hours = Math.floor(hh % 24);
    var days = Math.floor(dd);

    return {
      microseconds: microseconds,
      milliseconds: milliseconds,
      seconds: seconds,
      minutes: minutes,
      hours: hours,
      days: days,
      toString: toString
    };
  };

  var since = function(nano) {
    return now_1() - nano;
  };

  var now_1$1 = now_1;
  var since_1 = since;
  var parse_1 = parse;

  var microseconds = {
    now: now_1$1,
    since: since_1,
    parse: parse_1
  };

  function setAttribute(element, attributeName, value) {
    element.setAttribute(attributeName, value);
  }
  function setTextContent(element, value) {
    element.textContent = value;
  }
  function reorderElement(element, nextSibling) {
    nextSibling.parentNode.insertBefore(element, nextSibling);
  }
  function createTemplate(templateId) {
    const template = document.createElement("div"); // Preact component table
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
  function setInnerHTML(element, template) {
    element.innerHTML = template.innerHTML;
  }
  function appendChild(element, template) {
    element.appendChild(template.firstChild);
  }
  function insertBefore(element, template, nextSibling) {
    element.insertBefore(template.firstChild, nextSibling);
  }

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

  class ChangeAttributeMutation extends MutationRecord {
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
  class TextContentMutation extends MutationRecord {
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
  class ReorderMutation extends MutationRecord {
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
  class InnerHTMLMutation extends MutationRecord {
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
  class AppendChildMutation extends MutationRecord {
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
  class InsertBeforeMutation extends MutationRecord {
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
  } // Maybe test this at some point

  var MutationRecords = /*#__PURE__*/ Object.freeze({
    ChangeAttributeMutation: ChangeAttributeMutation,
    TextContentMutation: TextContentMutation,
    ReorderMutation: ReorderMutation,
    InnerHTMLMutation: InnerHTMLMutation,
    AppendChildMutation: AppendChildMutation,
    InsertBeforeMutation: InsertBeforeMutation
  });

  // Array of random selectors that we can use
  const selectors = [
    "div",
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
    "body > a",
    "amp-img",
    "amp-sidebar",
    "amp-ad",
    "amp-video",
    "amp-carousel"
  ];
  const getRandomSelector = () => {
    return selectors[Math.floor(Math.random() * selectors.length)];
  };
  const getAttributeWithValue = () => {
    const response = {
      attributeName: undefined,
      value: undefined
    };
    const attributeNames = Object.keys(attributeNamesToTypesObject); // Get a random attribute name

    response.attributeName =
      attributeNames[Math.floor(Math.random() * links.length)]; // Get the type for that attribute name

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
  const attributeNamesToTypesObject = {
    style: "string",
    class: "string",
    id: "string",
    href: "link",
    draggable: "boolean",
    title: "string",
    tabindex: "number",
    alt: "string",
    "aria-label": "string"
  };
  const getStringType = () => {
    return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris scelerisque iaculis dolor, a lacinia nunc lobortis quis. Donec interdum eget felis in eleifend. Nam rhoncus aliquet risus nec cursus. In pretium nulla erat, at suscipit mauris tempus eget. Proin consectetur interdum tellus id ullamcorper. Aliquam consequat in mi iaculis porta. Vestibulum ultrices ultricies consectetur. Donec nisi dolor, cursus id viverra vel, auctor quis arcu. Integer egestas, nisl vitae sollicitudin cursus, lacus urna vestibulum augue, eu suscipit ligula erat a tellus. Nullam pulvinar diam vel velit ullamcorper, a ultricies sapien varius. Quisque nisl mauris, laoreet ut imperdiet sit amet, aliquam at purus. Nulla mollis elit et urna accumsan, nec suscipit nisl commodo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis suscipit neque felis, non luctus libero consequat sed.";
  };
  const getBooleanType = () => {
    return Math.random() > 5;
  };
  const getNumberType = () => {
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
  const getLinkType = () => {
    return links[Math.floor(Math.random() * links.length)];
  };

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
    let target = getRandomElement(); // Next find our mutation record type

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
      mutation = new TextContentMutation(target, getStringType());
    }

    return mutation;
  };

  class BenchmarkRunner {
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
      }); //raf, inside raf setimteout 0, then timestamp end.
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

  function styleInject(css, ref) {
    if (ref === void 0) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === "undefined") {
      return;
    }

    var head = document.head || document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.type = "text/css";

    if (insertAt === "top") {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css =
    '.amp-benchmark {\n  width: 100%;\n  height: 500px;\n  background-color: #fafafa;\n  transition: height 0.5s;\n\n  overflow: auto;\n}\n\ndiv[type="template"] {\n  display: none;\n}\n\n.value-table {\n  border-collapse: collapse;\n  width: 100%;\n}\n\n.value-table th {\n  height: 50px;\n  font-weight: bold;\n  background-color: #9bbc0f;\n}\n\n.value-table td {\n  width: 75px;\n}\n\n.value-table tr:hover {\n  background-color: #f5f5f5;\n}\n\n.value-table th,\n.value-table td,\n.value-table tr {\n  text-align: left;\n  border: 1px solid black;\n  padding: 5px;\n  min-width: 150px;\n}\n';
  styleInject(css);

  console.log("AmpBenchmarkIife!"); // Run our benchamrks

  const benchmarkRunner = new BenchmarkRunner();
  benchmarkRunner.generateMutations(1000);
  benchmarkRunner.runAllMutations();

  const getTableHeadings = () => {
    const tableHeadings = [];
    Object.keys(benchmarkRunner.mutationResults).forEach(key => {
      tableHeadings.push(h("th", null, key));
    });
    return tableHeadings;
  };

  const getResultsTableRow = (
    name,
    statsCallback,
    stopConvertToMilliSeconds
  ) => {
    const statsTableCells = [];
    Object.keys(benchmarkRunner.mutationResults).forEach(key => {
      const times = [];
      benchmarkRunner.mutationResults[key].forEach(result => {
        times.push(result.time);
      });
      let result = statsCallback(times); // Ooooo this some top quality code right here

      if (!stopConvertToMilliSeconds) {
        result = result / 1000;
      } // Divide by 1000 to get milliseconds

      statsTableCells.push(h("td", null, result));
    });
    const tableRow = h("tr", null, h("td", null, name), statsTableCells);
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
  }; // Render the results

  class App extends Component {
    render() {
      return h(
        "div",
        {
          class: "amp-benchmark"
        },
        h("h1", null, "AMP Benchmark"),
        h(
          "button",
          {
            onclick: () => benchmarkRunner.runMutation()
          },
          "(Debug) Run Mutation"
        ),
        h("h2", null, "Results"),
        h(
          "div",
          null,
          h(
            "i",
            null,
            "Results recorded in microseconds, and converted to milliseconds"
          )
        ),
        h(
          "div",
          null,
          "Total Mutations run: ",
          benchmarkRunner.getTotalMutationsRun()
        ),
        h(
          "table",
          {
            class: "value-table"
          },
          h(
            "thead",
            null,
            h("tr", null, h("th", null, "Statistic"), getTableHeadings())
          ),
          h("tbody", null, getResultTableRows())
        )
      );
    }
  } // Find the first child of the body

  const benchmarkContainer = document.createElement("div");
  document.body.insertBefore(benchmarkContainer, document.body.firstChild);
  render(h(App, null), benchmarkContainer);
})();
