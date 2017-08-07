import * as React from "react";
import * as ReactDOM from "react-dom";
import "../css/app.less";
import {TetrisBoard} from './TetrisBoard';

ReactDOM.render(
    <TetrisBoard rows={20} columns={10}/>,
    document.getElementById("root-container")
);
