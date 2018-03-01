import {actionCreators as ac, actionTypes as at} from "common/Actions.jsm";
import {addSnippetsSubscriber} from "content-src/lib/snippets";
import {Base} from "content-src/components/Base/Base";
import {DetectUserSessionStart} from "content-src/lib/detect-user-session-start";
import {initStore} from "content-src/lib/init-store";
import {Provider} from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
import {reducers} from "common/Reducers.jsm";

const store = initStore(reducers, global.gActivityStreamPrerenderedState);

new DetectUserSessionStart(store).sendEventOrAddListener();

// If we are starting in a prerendered state, we must wait until the first render
// to request state rehydration (see Base.jsx). If we are NOT in a prerendered state,
// we can request it immedately.
if (!global.gActivityStreamPrerenderedState) {
  store.dispatch(ac.AlsoToMain({type: at.NEW_TAB_STATE_REQUEST}));
}

ReactDOM.hydrate(<Provider store={store}>
  <Base
    isFirstrun={new global.URL(global.document.location).search === "?firstrun=true"}
    isPrerendered={!!global.gActivityStreamPrerenderedState}
    locale={global.document.documentElement.lang}
    strings={global.gActivityStreamStrings} />
</Provider>, document.getElementById("root"));

addSnippetsSubscriber(store);
