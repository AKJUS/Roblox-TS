import { addExternal } from "@rbx/externals";
import * as React from "react";
import * as JSX from "react/jsx-runtime";
// eslint-disable-next-line no-restricted-imports
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";
import * as ReduxThunk from "redux-thunk";
import * as ReactRouter from "react-router";
import * as ReactRouterDOM from "react-router-dom";
import * as PropTypes from "prop-types";
import * as TanstackQuery from "@tanstack/react-query";

addExternal("React", { ...React });
addExternal("ReactJSX", { ...JSX });
addExternal("ReactDOM", ReactDOM);
addExternal("ReactDOMServer", ReactDOMServer);
addExternal("ReactRedux", ReactRedux);
addExternal("ReactRouter", ReactRouter);
addExternal("ReactRouterDOM", ReactRouterDOM);
addExternal("Redux", Redux);
addExternal("ReduxThunk", ReduxThunk);
addExternal("PropTypes", PropTypes);
addExternal("TanstackQuery", TanstackQuery);
