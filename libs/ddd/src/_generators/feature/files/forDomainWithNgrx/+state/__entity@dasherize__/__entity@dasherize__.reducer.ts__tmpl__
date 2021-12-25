import { createReducer, on, Action } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import * as <%= classify(entity) %>Actions from './<%= dasherize(entity) %>.actions';
import { <%= classify(entity) %> } from '../../entities/<%= dasherize(entity) %>';

export const <%= classify(entity).toUpperCase() %>_FEATURE_KEY = '<%=camelize(domain)%>-<%= camelize(entity) %>';

export interface State extends EntityState<<%= classify(entity) %>> {
  selectedId ?: string | number;          // which <%= classify(entity) %> record has been selected
  loaded      : boolean;                  // has the <%= classify(entity) %> list been loaded
  error      ?: string | null;            // last known error (if any)
}

export interface <%= classify(entity) %>PartialState {
  readonly [<%= classify(entity).toUpperCase() %>_FEATURE_KEY]: State;
}

export const <%= camelize(entity) %>Adapter: EntityAdapter<<%= classify(entity) %>> = createEntityAdapter<<%= classify(entity) %>>();

export const initialState: State = <%= camelize(entity) %>Adapter.getInitialState({
  // set initial required properties
  loaded : false
});

const <%= camelize(entity) %>Reducer = createReducer(
  initialState,
  on(<%= classify(entity) %>Actions.load<%= classify(entity) %>,
    state => ({ ...state, loaded: false, error: null })
  ),
  on(<%= classify(entity) %>Actions.load<%= classify(entity) %>Success,
    (state, { <%= camelize(entity) %> }) => <%= camelize(entity) %>Adapter.upsertMany(<%= camelize(entity) %>, { ...state, loaded: true })
  ),
  on(<%= classify(entity) %>Actions.load<%= classify(entity) %>Failure,
    (state, { error }) => ({ ...state, error })
  ),
);

export function reducer(state: State | undefined, action: Action) {
  return <%= camelize(entity) %>Reducer(state, action);
}
