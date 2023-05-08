export const boxTarget = {
  drop(props, monitor) {
    if (props.onDrop && monitor.isOver()) {
      props.onDrop(monitor);
    }
  },
};
