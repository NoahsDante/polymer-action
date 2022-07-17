## 背景
随着React Hooks 普及起来，组件逻辑写法变成函数式；**逻辑函数声明、函数代码结构**，随着逻辑增加复杂，代码组织混乱，函数声明散乱；<br />最关键的一点，每个人对代**码理解不一样**，有的喜欢在一个`function` 写大段逻辑，有的喜欢拆分逻辑很细，<br />就会使在项目维护时**，代码风格、代码结构，越来越不统一，难以维护**。<br />针对上述情况，需要可以组织代码结、梳理逻辑的方法，从而达到项目维护性高、**代码结构统一、逻辑清晰**
## 设计理念
### 抽象代码结构
在编写代码的过程中，发现可以抽象出公共代码结构；

1. **声明可变数据**/共享变量声明、state 声明/let xxx= xxx/useState
1. **方法声明**/function xx () {} /action/dispatch
1. **方法调用** / xx() / action()/dispatch()

![polymerAction7.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/431922/1654586560681-27d02cff-f041-4e78-8fcf-41436fbd4b76.jpeg#clientId=uc0547603-9b1f-4&crop=0&crop=0&crop=1&crop=1&from=ui&height=883&id=u54afbf1c&margin=%5Bobject%20Object%5D&name=polymerAction7.jpg&originHeight=1177&originWidth=565&originalType=binary&ratio=1&rotation=0&showTitle=false&size=182498&status=done&style=none&taskId=u396e0cc2-f564-49f4-8077-7c06d572f6d&title=&width=424)<br />通过上图，可以把常见组件内部逻辑，分成3个部分，**其中3、4属于相同部分：**

1. :**主要是声明数据，**有useState/let  xxx = 11；
1. :**声明函数、方法，会涉及修改数据**`**setcounts**`**、使用数据**`**sendLogcount**`**;**
   1. 其中修改与使用里会有一些辅助方法`fetch`来执行对应逻辑；
3. **调用方法**，**3与4部分都在视图中使用函数与方法，统一称为调用方法。**

把代码结构拆分、分析之后；其实在日常的开发过程中大部分代码复杂逻辑都在**1与2部分，而2部分里有相互调用的逻辑，各种辅助函数相互杂糅在一起，**慢慢的使得代码越来越复杂，难以阅读。
### 声明与定义
我们可以把1与2部分复杂封装起来，定义好规范干净的结构如<br />![polymerAction5.jpg](https://cdn.nlark.com/yuque/0/2022/jpeg/431922/1654586471293-05d9c7a4-2aa4-443f-91c9-9010c0d2547d.jpeg#clientId=uc0547603-9b1f-4&crop=0&crop=0&crop=1&crop=1&from=ui&id=ub381705a&margin=%5Bobject%20Object%5D&name=polymerAction5.jpg&originHeight=887&originWidth=1695&originalType=binary&ratio=1&rotation=0&showTitle=false&size=519968&status=done&style=none&taskId=u59217522-0999-4574-9429-b78f9c3d434&title=)<br />根据上图可知，把原先1、2、3 部分统一封装在一个`hooks.js`文件里；

- 原先1与2部分代码通过调用`**polymerAction**`**给聚合起来，把state与actions/方法声明给放在一起；再通过**`**const [state, actions, shareVars] = usePolymerActionState(countActions)**`**对外暴露数据与acions/方法。**
- **原先3部分封装hooks使用**`**usePolymerActionState**`**暴露方法调用，**走正常调用逻辑**。**
- **在视图里，正常使用hooks 封装方法，**`**return**`**出**`**usePolymerActionState**`**暴露数据与方法，正常调用逻辑。**

可以看出**核心部分**，就是把**state与action封装在一起高内聚**，通过对象组织代码结构，而对象可以进行**组合方式，**来组织更大复杂的代码逻辑与结构。<br />从视图上来看，只调用暴露出来的方法。<br />总结一下，按照上述方式，可以提高项目可维护性，代码结构统一。
## 用法
```javascript
/** @jsx createElement */
import { createElement, useEffect, useState, useRef, useMemo } from 'rax';
import { moduleInit } from './utils';
export default function Whrealtimetrendinghotels(props) {
  const { gdc, mds, pageUtils } = props;
  moduleInit({
    gdc,
    mds,
    pageUtils
  })(useState, useEffect, useRef,useMemo);

  return (<CustomComponent
   
  />);
}

```
入口文件需要在`moduleInit` 传入useMemo,注意传入位置，**直接按照上述位置传入即可。**<br />**ps：为了兼容小程序，在小程序里，库不能直接引入**i`mport { createElement, useEffect, useState, useRef, useMemo } from 'rax';`

```javascript
import {initHooksAction} from './hooks';
function CustomComponent(props) {
  const [
    count, {setCounts, sendLog}
  ] = initHooksAction();

 return (
   <View style={{width: 100, height: 100, backgroundColor: 'red'}} onClick={() => {
   setCounts('参入数据了');
 }}>
   
   <Text>{count}</Text>
</View>
 
 
 );

}
```
`initHooksAction`可以拿到数据、方法；走正常逻辑；
```javascript
const countActions = polymerAction({
  count: 0
}, {
  setCounts({state, setState}, params) {
    setState({
      count: ++state.count
    })
    console.log(params)
  },
  fetch({state, setState}, count) {
    console.log(`接口请求埋点${
      count}`)
  },
  sendLog({state, setState, actions}, count) {
    actions.fetch(count)
    console.log(`发送相关埋点${
      count}`)
  },
}, {});

function initHooksAction() {
  const [state, actions, shareVars] = usePolymerActionState(countActions);
  useEffect(() => {
    sendLog(state.count);
  }, [state.count])
  return [state.count, actions, shareVars]
}

```

- polymerAction：声明state、actions、shareVar;
- usePolymerActionState:底层会重写actions方法，shareVar数据，
   - 返回数据是对应`polymerAction`里声明的数据、方法
- initHooksAction：封装hooks 逻辑
### 高级用法
#### 拆分/合并action
```javascript
const infiniteScrollAction = polymerAction({
  isLoadingShow: false,
  isLoadingError: false,
  isEmptyData: false,
}, {
  showLoading({ state, setState, shareVars, actions }) {
    setState({
      isLoadingShow: true,
      isLoadingError: false,
      isEmptyData: false
    });
  },
  closeLoading({ state, setState, shareVars, actions }) {
    setState({
      isLoadingShow: false
    });
    shareVars.throttleTarget = true;
  },
  ...,
}, {
  throttleTarget: true,
});
const handleAction = polymerAction({},{
  /**
   *  刷新接口
   */
  onRefreshList({ state, setState, shareVars, actions }) {
  ....
  },
},{})
const scrollListAction = polymerAction({
  cityList: [],
  recommendList: [],
  isCityListShow: false,
}, {
  initListParam({ state, setState, shareVars, actions }) {
    shareVars.pageNo = 0;
    shareVars.dataVersion = 0;
  },

  exp({ state, setState, shareVars, actions }, data) {
    const {cityName, cityCode} = shareVars.cityData;
    let shidsArr = [];
    if (data[0] && data[0].hotHotelList) {
      shidsArr = hotCityListShids(data);
      sendUT.exp(cityName, shidsArr[0].join('/'), shidsArr[1].join('/'));
    } else {
      shidsArr = shids(data);
      sendUT.exp(cityName, '', shidsArr.join('/'));
    }
  },
  ...,
}, {
  pageNo: 0,
  dataVersion: 0,
  cityData: {
    cityName: '',
    cityCode: '',
  }
});
function initEffect(param) {
  const [state, action] = usePolymerActionState(mergePolymerAction(scrollListAction,infiniteScrollAction,handleAction));
  ...
  ...
  return [state, action]
}

```
通过`**mergePolymerAction**`可以把多个**action，**`scrollListAction`、`infiniteScrollAction`** 、**`handleAction`合并；这样就可以任意拆分**action。**
## API
### useSetState
> 管理 object 类型 state 的 Hooks，用法与 class 组件的 this.setState 基本一致。

```javascript
const [state,setState] = useSetState({
 hehe:1,
 aaa:1
});
// 修改
setState({
aaa:2
})
```
### <br />getAction
> 从polymerAction里，获取actions

```javascript
const handleAction = polymerAction({},{
  /**
   *  刷新接口
   */
  onRefreshList({ state, setState, shareVars, actions }) {
  ....
  },
},{});

const handle = getAction(handleAction);

console.log(handle);

,{
  /**
   *  刷新接口
   */
  onRefreshList({ state, setState, shareVars, actions }) {
  ....
  },
}

```
### polymerAction
> 生成action 集合


```javascript
const scrollListAction = polymerAction({
  cityList: [],
  recommendList: [],
  isCityListShow: false,
}, {
  initListParam({ state, setState, shareVars, actions }) {
    shareVars.pageNo = 0;
    shareVars.dataVersion = 0;
  },
  ...,
}, {
  pageNo: 0,
  dataVersion: 0,
  cityData: {
    cityName: '',
    cityCode: '',
  }
});
```

```javascript
const [state,actions,shareVal] = polymerAction(stateObj,actionObj,shareValObj)
```
**Params**

| **参数** | **说明** | **类型** | **默认值** |
| --- | --- | --- | --- |
| **stateObj** | 必传,声明state | `object` | {} |
| **actionObj** | 必传，声明方法、函数 | `object` | {} |
| **shareValObj** | 可选项，传入默认的状态值 | `boolean` | {} |

**Result**

| **参数** | **说明** | **类型** |
| --- | --- | --- |
| **state** | 状态值 | `object` |
| **actions** | 操作集合 | `Actions` |
| **shareVal** | 共享变量 | `object` |

**actionObj**
```javascript
const handleAction = polymerAction({},{
  /**
   *  刷新接口
   */
  onRefreshList({ state, actions,shareVars,setState,setShareVars },param) {
  ...
  },
     /**
   *  接口报错，刷新接口
   */
  onRefreshListError({ state, setState, shareVars, actions }) {
    actions.getList(true);
  },
},{});
```
| **参数** | **说明** | **类型** |
| --- | --- | --- |
| **state** | 获取 stateObj | `**object**` |
| **actions** | 获取 actionObj | `**object**` |
| **shareVars** | 获取 shareValObj | `**object**` |
| **setState** | 设置 state | `**({}) => void**` |
| **setShareVars** | 设置 shareVal | `**({}) => void**` |

### usePolymerActionState
>  根据传入`action`**，转换成能改变页面的**`**PolymerActionState**`

```javascript
function initEffect(param) {
  const [state, actions] = usePolymerActionState(scrollListAction);
  ...
  ...
  return [state, action]
}
```
```javascript
const [state, actions,shareVal] = usePolymerActionState(polymerAction);
```
**Params**

| **参数** | **说明** | **类型** |
| --- | --- | --- |
| polymerAction | 必传,声明`polymerActionState` 集合 | `**Array**` |

**Result**

| **参数** | **说明** | **类型** |
| --- | --- | --- |
| **state** | 状态值 | `**object**` |
| **actions** | 操作集合 | `**object**` |
| **shareVal** | 共享变量 | `**object**` |

### mergePolymerAction
> 合并多个 `**polymerAction**`

```javascript
mergePolymerAction(scrollListAction,infiniteScrollAction,handleAction)
```

### injectState
> 使用rax 体系，需要从外手动传`newUseState, newUseRef, newUseMemo`,是为了兼容小程序不报错

```javascript
injectState(useState,useRef,useMemo);
```

## 实战项目
[http://gitlab.alibaba-inc.com/fliggyshopmod/whrealtimetrendinghotels/blob/polymerAction/src/components/Llist/hooks.js#L16](http://gitlab.alibaba-inc.com/fliggyshopmod/whrealtimetrendinghotels/blob/polymerAction/src/components/Llist/hooks.js#L16)

## 代码
```javascript


let useState = null;
let useRef = null;
let useMemo = null;
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

```

