import { createAction, props } from '@ngrx/store';
import { <%= classify(entity) %> } from '../../entities/<%= dasherize(entity) %>';

export const load<%= classify(entity) %> = createAction(
  '[<%= classify(entity) %>] Load <%= classify(entity) %>'
);

export const load<%= classify(entity) %>Success = createAction(
  '[<%= classify(entity) %>] Load <%= classify(entity) %> Success',
  props<{ <%= camelize(entity) %>: <%= classify(entity) %>[] }>()
);

export const load<%= classify(entity) %>Failure = createAction(
  '[<%= classify(entity) %>] Load <%= classify(entity) %> Failure',
  props<{ error: any }>()
);
