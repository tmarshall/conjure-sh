const setOrg = (store, { org }) => {
  return Object.assign({}, store, {
    timeline: null, // clearing timeline, which will cause loader and xhr
    org
  });
};

const clearTimeline = store => {
  return Object.assign({}, store, {
    timeline: null
  });
};

const pushTimeline = (store, { addition }) => {
  const timeline = (store.timeline || []).slice();
  timeline.push(...addition);

  return Object.assign({}, store, {
    timeline
  });
};

const unshiftTimeline = (store, { addition }) => {
  const timeline = store.timeline.slice();
  timeline.unshift(...addition);

  return Object.assign({}, store, {
    timeline
  });
};

export default {
  setOrg,
  clearTimeline,
  pushTimeline,
  unshiftTimeline
};
