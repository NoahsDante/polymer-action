import {polymerAction,useSetState,usePolymerActionState} from '../PolymerAction';


const buttonAction = polymerAction({
  val: 0,
}, {
  click({ state, setState, shareVars, actions }) {
    setState({
      val:'点我了'
    });
  },
}, {
});
function useInit() {
  const [state,action] = usePolymerActionState(buttonAction);
  return [state,action];
}

export default useInit;