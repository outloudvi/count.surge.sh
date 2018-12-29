import { Reducer } from "redux";

// INTERFACES //
interface revision {
  data: number[],
  edited: [number, number]
}

interface Stated {
  length: number,
  data: number[],
  edited: [number, number],
  past: revision[],
  revisionid: number
};

interface Operation_SET_LENGTH {
  type: 'SET_LENGTH',
  length: number
};

interface Operation_UPDATE {
  type: 'UPDATE',
  from: number,
  to: number
};

interface Operation_IMPORT {
  type: 'IMPORT',
  data: number[]
}

interface Operation_DOWNDATE {
  type: 'DOWNDATE',
  target: number
}

interface Operation_UNDO {
  type: 'UNDO'
}

type Operation = Operation_SET_LENGTH | Operation_UPDATE | Operation_IMPORT | Operation_DOWNDATE | Operation_UNDO;

interface pre_array {
  fill(i: number): number[]
};

// INTERFACES END //
// CONSTANTS //

const initialState: Stated = {
  length: 0,
  data: [],
  edited: [0, 0],
  past: [],
  revisionid: 0
}

// CONSTANTS END //

export function counter(state: Stated = initialState, action: Operation): Stated {
  let ret: Stated = { ...state };
  switch (action.type) {
    case 'SET_LENGTH':
      let length = (<Operation_SET_LENGTH>action).length;
      return {
        length: length,
        data: (<pre_array><unknown>Array(length + 1)).fill(0),
        edited: [1, length],
        past: [],
        revisionid: 0
      }
    case 'UPDATE':
      let act: Operation_UPDATE = <Operation_UPDATE>action;
      ret.past.push({
        data: [...ret.data],
        edited: ret.edited
      });
      ret.revisionid++;
      for (let i = act.from; i <= act.to; i++) {
        ret.data[i] = ret.data[i] ? ret.data[i] + 1 : 1;
      }
      ret.edited = [act.from, act.to]
      return ret
    case 'IMPORT':
      return {
        length: (<Operation_IMPORT>action).data.length,
        data: (<Operation_IMPORT>action).data,
        edited: [1, (<Operation_IMPORT>action).data.length],
        past: [],
        revisionid: 0
      }
    case 'DOWNDATE':
      ret.revisionid++;
      ret.past.push({
        data: ret.data,
        edited: ret.edited
      });
      ret.data[(<Operation_DOWNDATE>action).target]--;
      return ret;
    case 'UNDO':
      let lastRevision:revision = ret.past.pop();
      ret.data = lastRevision.data;
      ret.edited = lastRevision.edited;
      ret.revisionid--;
      return ret;
  }
}