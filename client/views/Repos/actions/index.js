const selectPlacementInBranchTree = (store, { level, value }) => {
  const newStore = Object.assign({}, store);

  switch (level) {
    case 'none':
      newStore.org = null;
      newStore.repo = null;
      newStore.branch = null;
      newStore.level = 'none';
      break;

    case 'org':
      newStore.org = value;
      newStore.repo = null;
      newStore.branch = null;
      newStore.level = 'org';
      break;

    case 'repo':
      newStore.repo = value;
      newStore.branch = null;
      newStore.level = 'repo';
      break;

    case 'branch':
      newStore.branch = value;
      newStore.level = 'branch';
      break;

    default:
      return store;
  }

  return newStore;
};

const doneOnboarding = store => {
  const newStore = Object.assign({}, store);
  newStore.onboard = false;
  return newStore;
};

export default {
  selectPlacementInBranchTree,
  doneOnboarding
};
