// bring in react tools
import * as React from "react";

// bring in popup message types
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// only show one message at time
const TOAST_LIMIT = 1;
// wait long time before auto removing
const TOAST_REMOVE_DELAY = 1000000;

// what a popup message looks like
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// different things you can do to messages
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// counter for making unique ids
let count = 0;

// make new unique id for message
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// type for action names
type ActionType = typeof actionTypes;

// different actions you can send
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

// what the state looks like
interface State {
  toasts: ToasterToast[];
}

// remember timers for each message
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// schedule message to be removed later
const addToRemoveQueue = (toastId: string) => {
  // stop if already scheduled
  if (toastTimeouts.has(toastId)) {
    return;
  }

  // set timer to remove message
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  // save timer
  toastTimeouts.set(toastId, timeout);
};

// handle actions to change state
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    // add new message to list
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    // change existing message
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    // start hiding message
    case "DISMISS_TOAST": {
      const { toastId } = action;

      // schedule message for removal
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // mark message as closed
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    // delete message from list
    case "REMOVE_TOAST":
      // remove all if no id given
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      // remove specific message
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// list of functions watching for changes
const listeners: Array<(state: State) => void> = [];

// current state of all messages
let memoryState: State = { toasts: [] };

// send action to change state
function dispatch(action: Action) {
  // update state with action
  memoryState = reducer(memoryState, action);
  // tell all watchers about change
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// message without id yet
type Toast = Omit<ToasterToast, "id">;

// show new popup message
function toast({ ...props }: Toast) {
  // make unique id for message
  const id = genId();

  // function to change this message
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  // function to hide this message
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // add message to state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // return control functions
  return {
    id: id,
    dismiss,
    update,
  };
}

// tool to manage popup messages
function useToast() {
  // remember current message state
  const [state, setState] = React.useState<State>(memoryState);

  // run once when component loads
  React.useEffect(() => {
    // start watching for changes
    listeners.push(setState);
    // stop watching when leaving page
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // return state and control functions
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// let other files use these tools
export { useToast, toast };
