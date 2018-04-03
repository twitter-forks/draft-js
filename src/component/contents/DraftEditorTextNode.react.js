/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const React = require('React');
const UserAgent = require('UserAgent');

const invariant = require('invariant');

/**
 * In IE, spans with <br> tags render as two newlines. By rendering a span
 * with only a newline character, we can be sure to render a single line.
 *
 * In addition, Edge deletes the <br> when typing in a span with just <br> in it.
 * However because <br> is only rendered on empty line (see `render()`), after typing React
 * would tries to remove the <br> tag, which may already been removed by Edge.
 * This causes the render to fail. Fall back to \n on Edge as well, for this reason.
 */
const useNewlineChar =
  UserAgent.isBrowser('IE <= 11') || UserAgent.isBrowser('Edge');

/**
 * Check whether the node should be considered a newline.
 */
function isNewline(node: Element): boolean {
  return useNewlineChar ? node.textContent === '\n' : node.tagName === 'BR';
}

/**
 * Placeholder elements for empty text content.
 *
 * What is this `data-text` attribute, anyway? It turns out that we need to
 * put an attribute on the lowest-level text node in order to preserve correct
 * spellcheck handling. If the <span> is naked, Chrome and Safari may do
 * bizarre things to do the DOM -- split text nodes, create extra spans, etc.
 * If the <span> has an attribute, this appears not to happen.
 * See http://jsfiddle.net/9khdavod/ for the failure case, and
 * http://jsfiddle.net/7pg143f7/ for the fixed case.
 */
const NEWLINE_A = ref =>
  useNewlineChar ? (
    <span key="A" data-text="true" ref={ref}>
      {'\n'}
    </span>
  ) : (
    <br key="A" data-text="true" ref={ref} />
  );

const NEWLINE_B = ref =>
  useNewlineChar ? (
    <span key="B" data-text="true" ref={ref}>
      {'\n'}
    </span>
  ) : (
    <br key="B" data-text="true" ref={ref} />
  );

type Props = {
  children: string,
  style?: Object,
};

/**
 * The lowest-level component in a `DraftEditor`, the text node component
 * replaces the default React text node implementation. This allows us to
 * perform custom handling of newline behavior and avoid re-rendering text
 * nodes with DOM state that already matches the expectations of our immutable
 * editor state.
 */
class DraftEditorTextNode extends React.Component<Props> {
  _forceFlag: boolean;
  _node: ?(HTMLSpanElement | HTMLBRElement);

  constructor(props: Props) {
    super(props);
    // By flipping this flag, we also keep flipping keys which forces
    // React to remount this node every time it rerenders.
    this._forceFlag = false;
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    const node = this._node;
    const shouldBeNewline = nextProps.children === '';
    invariant(node instanceof Element, 'node is not an Element');
    if (shouldBeNewline) {
      return !isNewline(node);
    }
    return node.textContent !== nextProps.children;
  }

  componentDidMount(): void {
    this._forceFlag = !this._forceFlag;
  }

  componentDidUpdate(): void {
    this._forceFlag = !this._forceFlag;
  }

  render(): React.Node {
    if (this.props.children === '') {
      return this._forceFlag
        ? NEWLINE_A(ref => (this._node = ref))
        : NEWLINE_B(ref => (this._node = ref));
    }

    const additionalProps = {};
    if (typeof this.props.style === 'object') {
      additionalProps.style = this.props.style;
    }

    return (
      <span
        key={this._forceFlag ? 'A' : 'B'}
        data-text="true"
        ref={ref => (this._node = ref)}
        {...additionalProps}>
        {this.props.children}
      </span>
    );
  }
}

module.exports = DraftEditorTextNode;
