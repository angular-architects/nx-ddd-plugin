import { createFeatureSelector, createSelector } from '@ngrx/store';
import { <%= classify(entity).toUpperCase() %>_FEATURE_KEY, State, <%= classify(entity) %>PartialState, <%= camelize(entity) %>Adapter } from './<%= dasherize(entity) %>.reducer';

// Lookup the '<%= classify(entity) %>' feature state managed by NgRx
export const get<%= classify(entity) %>State = createFeatureSelector<<%= classify(entity) %>PartialState, State>(<%= camelize(entity).toUpperCase() %>_FEATURE_KEY);

const { selectAll, selectEntities } = <%= camelize(entity) %>Adapter.getSelectors();

export const get<%= classify(entity) %>Loaded = createSelector(
  get<%= classify(entity) %>State,
  (state: State) => state.loaded
);

export const get<%= classify(entity) %>Error = createSelector(
  get<%= classify(entity) %>State,
  (state: State) => state.error
);

export const getAll<%= classify(entity) %> = createSelector(
  get<%= classify(entity) %>State,
  (state: State) => selectAll(state)
);

export const get<%= classify(entity) %>Entities = createSelector(
  get<%= classify(entity) %>State,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  get<%= classify(entity) %>State,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  get<%= classify(entity) %>Entities,
  getSelectedId,
  (entities, selectedId) => selectedId && entities[selectedId]
);
