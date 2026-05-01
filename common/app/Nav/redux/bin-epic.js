import { ofType } from 'redux-epic';

import { types } from './';
import { types as mapTypes } from '../../Map/redux';
import { types as challengeTypes } from '../../routes/Challenges/redux';

import { hidePane } from '../../Panes/redux';

export default function binEpic(actions) {
  // Legacy navbar handler for clickOnMap (no-op on the panes reducer today,
  // but kept in case other middleware listens for it).
  const fromNav = actions::ofType(types.clickOnMap)
    .map(() => hidePane('Curriculum'));

  // Auto-hide the Curriculum pane once the user picks a lesson, so the
  // editor/lesson get the screen. The user can re-open it from the
  // "Curriculum" pill in the navbar.
  const onSelect = actions::ofType(mapTypes.clickOnChallenge)
    .map(() => ({ type: challengeTypes.toggleMap }));

  return fromNav.merge(onSelect);
}
