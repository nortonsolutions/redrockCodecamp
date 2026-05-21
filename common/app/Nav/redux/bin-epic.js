import { ofType } from 'redux-epic';

import { types } from './';

import { hidePane } from '../../Panes/redux';

export default function binEpic(actions) {
  // Legacy navbar handler for clickOnMap (no-op on the panes reducer today,
  // but kept in case other middleware listens for it).
  const fromNav = actions::ofType(types.clickOnMap)
    .map(() => hidePane('Curriculum'));

  // NOTE: Auto-hiding the Curriculum pane on lesson selection was removed
  // because it was over-aggressive: on mobile it suppressed the lesson too,
  // and on desktop it removed the curriculum entirely. The user can still
  // toggle Curriculum from the navbar pill.

  return fromNav;
}
