import {useState,useRef,useMemo} from 'react';
function useSetState(initData) {
  const [state, setState] = useState(initData);
  const dispatch = (next) => {
    if ( typeof next === 'object' ) {
      setState((pre) => Object.assign({}, pre, next));
    }
    else {
      setState(next);
    }
  };
  return [state, dispatch];
}

function polymerAction(state, action = {}, shareVar = {}) {
  return [state, action, shareVar];
}

function newActionData(actions, states, shareVars, setState) {
  let newAction = {};
  Object.keys(actions)
    .forEach((name) => {
      const old = actions[name];
      if ( typeof old === 'function' ) {
        // 重新写actions 方法
        newAction[name] = function(...arg) {
          return old.call(null, {
            state: states,
            shareVars,
            actions: newAction,
            setState(param, fn = () => {}) {
              setState(param);
              fn(param);
            },
            setShareVars(param) {
              shareVars = Object.assign(shareVars, param);
            },
          }, ...arg);
        };
      }
    });
  return newAction;
}

// 与hooks 关联
function usePolymerActionState(param) {
  const [state, action = {}, shareVar = {}] = param;
  const actions = action;
  // Object.assign({}, xxx) 多个加载重复组件生成对应数据,防止数据相互覆盖情况
  const [states, setState] = useSetState(Object.assign({}, state));
  // 生成新共享变量
  const shareVars =  useMemo(() => (Object.assign({}, shareVar)), []) ;
  shareVars.updateAfterState = states;
  const newAction =  useMemo(() => (newActionData(actions, states, shareVars, setState)), [action, states, shareVars])

  return [states, newAction, shareVars];
}

function getAction(polymer) {
  return polymer[1];
}

function mergePolymerAction(action1, ...res) {
  const actions = action1.map(function (val, index) {
    let resAction = {};
    res.forEach((action) => {
      Object.assign(resAction, action[index]);
    });
    return Object.assign({}, val, resAction);
  });
  return actions;
}


function injectState(newUseState, newUseRef, newUseMemo) {
  if (!newUseState || !newUseMemo) {
    console.warn(`请在模块中的moduleInit传入useState、useMemo， 如：
    moduleInit({ gdc,mds,pageUtils})
    (useState, useEffect, useRef, useMemo);`);
    return
  }
  useState = newUseState;
  useRef = newUseRef;
  useMemo = newUseMemo;
}

export {
  useSetState,
  getAction,
  polymerAction,
  usePolymerActionState,
  mergePolymerAction,
  injectState
};
