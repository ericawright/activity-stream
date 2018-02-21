import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import React from "react";

export class _StartupOverlay extends React.PureComponent {
  render() {
    return (
      <div className="test-wrapper">
        <canvas className="canvas">
          HTML5 is not supported.
        </canvas>
      </div>
    );
  }
}

export const StartupOverlay = connect()(injectIntl(_StartupOverlay));
