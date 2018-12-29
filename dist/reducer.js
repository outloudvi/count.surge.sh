"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// INTERFACES END //
// CONSTANTS //
var initialState = {
    length: 0,
    data: [],
    edited: [0, 0],
    past: [],
    revisionid: 0
};
// CONSTANTS END //
function counter(state, action) {
    if (state === void 0) { state = initialState; }
    var ret = __assign({}, state);
    switch (action.type) {
        case 'SET_LENGTH':
            var length_1 = action.length;
            return {
                length: length_1,
                data: Array(length_1 + 1).fill(0),
                edited: [1, length_1],
                past: [],
                revisionid: 0
            };
        case 'UPDATE':
            var act = action;
            ret.past.push({
                data: ret.data.slice(),
                edited: ret.edited
            });
            ret.revisionid++;
            for (var i = act.from; i <= act.to; i++) {
                ret.data[i] = ret.data[i] ? ret.data[i] + 1 : 1;
            }
            ret.edited = [act.from, act.to];
            return ret;
        case 'IMPORT':
            return {
                length: action.data.length,
                data: action.data,
                edited: [1, action.data.length],
                past: [],
                revisionid: 0
            };
        case 'DOWNDATE':
            ret.revisionid++;
            ret.past.push({
                data: ret.data,
                edited: ret.edited
            });
            ret.data[action.target]--;
            return ret;
        case 'UNDO':
            var lastRevision = ret.past.pop();
            ret.data = lastRevision.data;
            ret.edited = lastRevision.edited;
            ret.revisionid--;
            return ret;
    }
}